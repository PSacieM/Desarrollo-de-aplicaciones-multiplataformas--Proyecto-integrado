package com.myvideogamelist.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.myvideogamelist.backend.model.Comment;

/**
 * Repositorio JPA para la entidad Comment.
 * 
 * Permite acceder a los comentarios almacenados en la base de datos.
 * Incluye métodos personalizados para obtener comentarios por juego, por usuario, últimos comentarios, etc.
 */
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Devuelve todos los comentarios de un juego concreto.
     */
    List<Comment> findByGameId(Long gameId);

    /**
     * Devuelve todos los comentarios realizados por un usuario concreto.
     */
    List<Comment> findByUserId(Long userId);

    /**
     * Devuelve los 3 comentarios más recientes de un usuario.
     */
    List<Comment> findTop3ByUserIdOrderByCommentDateDesc(Long userId);

    /**
     * Devuelve el comentario que un usuario ha hecho sobre un juego concreto, si existe.
     */
    Optional<Comment> findByUserIdAndGameId(Long userId, Long gameId);

    /**
     * Devuelve los comentarios más recientes de toda la aplicación.
     * 
     * Utiliza un parámetro Pageable para poder limitar el número de resultados.
     */
    @Query("SELECT c FROM Comment c ORDER BY c.commentDate DESC")
    List<Comment> findLatestComments(Pageable pageable);
}
