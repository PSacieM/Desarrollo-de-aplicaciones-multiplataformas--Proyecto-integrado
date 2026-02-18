package com.myvideogamelist.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.dto.CommentDTO;
import com.myvideogamelist.backend.mapper.CommentMapper;
import com.myvideogamelist.backend.model.Comment;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.CommentRepository;
import com.myvideogamelist.backend.repository.GameRepository;
import com.myvideogamelist.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona los comentarios de los juegos.
 * 
 * Permite:
 * - obtener comentarios
 * - crear comentarios
 * - actualizar comentarios
 * - eliminar comentarios (con control de permisos)
 * - enviar email cuando un admin elimina un comentario
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final EmailService emailService;

    /**
     * Devuelve todos los comentarios.
     */
    public List<CommentDTO> getAllComments() {
        return commentRepository.findAll().stream()
                .map(CommentMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve un comentario por ID.
     */
    public Optional<CommentDTO> getCommentById(Long id) {
        return commentRepository.findById(id).map(CommentMapper::toDTO);
    }

    /**
     * Devuelve los comentarios de un juego.
     */
    public List<CommentDTO> getCommentsByGame(Long gameId) {
        return commentRepository.findByGameId(gameId).stream()
                .map(CommentMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve todos los comentarios de un usuario.
     */
    public List<CommentDTO> getAllCommentsByUser(Long userId) {
        return commentRepository.findByUserId(userId).stream()
                .map(CommentMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve los 3 últimos comentarios de un usuario.
     */
    public List<CommentDTO> getLatestCommentsByUser(Long userId) {
        return commentRepository.findTop3ByUserIdOrderByCommentDateDesc(userId).stream()
                .map(CommentMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve los 3 comentarios más recientes de la plataforma.
     */
    public List<CommentDTO> getLatestComments() {
        return commentRepository.findLatestComments(PageRequest.of(0, 3)).stream()
                .map(CommentMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo comentario para un juego.
     * 
     * - El usuario solo puede comentar una vez por juego.
     * - Se establece la fecha actual.
     */
    public CommentDTO createComment(CommentDTO dto, Long currentUserId) {
        Long gameId = dto.getGameId();

        // Validar que el usuario no haya comentado este juego antes
        if (commentRepository.findByUserIdAndGameId(currentUserId, gameId).isPresent()) {
            throw new IllegalStateException("Ya has comentado este juego. Debes editar tu comentario.");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        Comment comment = CommentMapper.toEntity(dto);
        comment.setUser(user);
        comment.setGame(game);
        comment.setCommentDate(LocalDateTime.now());

        return CommentMapper.toDTO(commentRepository.save(comment));
    }

    /**
     * Actualiza un comentario existente.
     * 
     * - Solo el autor del comentario puede actualizarlo.
     */
    public CommentDTO updateComment(Long id, CommentDTO dto, Long currentUserId) {
        Comment existing = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        if (!existing.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("No tienes permiso para editar este comentario");
        }

        if (dto.getCommentText() != null) {
            existing.setCommentText(dto.getCommentText());
            existing.setUpdatedAt(LocalDateTime.now());
        }

        return CommentMapper.toDTO(commentRepository.save(existing));
    }

    /**
     * Elimina un comentario.
     * 
     * - Puede eliminarlo el autor o un administrador.
     * - Si lo elimina un admin → se envía un email al autor informándole.
     */
    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isAuthor = comment.getUser().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole().getName().equalsIgnoreCase("admin");

        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("No tienes permiso para borrar este comentario");
        }

        // Si lo elimina un admin, enviar email al autor
        if (!isAuthor && isAdmin) {
            User commentAuthor = comment.getUser();

            String to = commentAuthor.getEmail();
            String subject = "Tu comentario ha sido eliminado";
            String body = "Hola " + commentAuthor.getUsername() + ",\n\n"
                        + "Un administrador ha eliminado tu comentario en el juego: "
                        + comment.getGame().getTitle() + ".\n\n"
                        + "Comentario eliminado:\n\"" + comment.getCommentText() + "\"\n\n"
                        + "Si consideras que esto ha sido un error, puedes contactar con el soporte.\n\n"
                        + "Saludos,\nMyVideogameList";

            emailService.sendSimpleEmail(to, subject, body);
        }

        commentRepository.delete(comment);
    }
}
