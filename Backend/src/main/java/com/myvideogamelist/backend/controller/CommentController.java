package com.myvideogamelist.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.dto.CommentDTO;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.service.CommentService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con los comentarios de los juegos.
 * 
 * Permite a los usuarios consultar, crear, actualizar y eliminar comentarios.
 */
@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CommentController {
    
    /**
     * Servicio que contiene la lógica de negocio para la gestión de comentarios.
     */
    private final CommentService commentService;

    /**
     * Devuelve todos los comentarios de la base de datos.
     * 
     * URL: GET /api/comments
     */
    @GetMapping
    public List<CommentDTO> getAllComments() {
        return commentService.getAllComments();
    }

    /**
     * Devuelve un comentario específico por su ID.
     * 
     * URL: GET /api/comments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        return commentService.getCommentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Devuelve todos los comentarios asociados a un juego concreto.
     * 
     * URL: GET /api/comments/game/{gameId}
     */
    @GetMapping("/game/{gameId}")
    public List<CommentDTO> getCommentsByGame(@PathVariable Long gameId) {
        return commentService.getCommentsByGame(gameId);
    }

    /**
     * Devuelve todos los comentarios realizados por un usuario concreto.
     * 
     * URL: GET /api/comments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public List<CommentDTO> getAllCommentsByUser(@PathVariable Long userId) {
        return commentService.getAllCommentsByUser(userId);
    }

    /**
     * Devuelve los comentarios más recientes de un usuario concreto.
     * 
     * URL: GET /api/comments/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public List<CommentDTO> getLatestCommentsByUser(@PathVariable Long userId) {
        return commentService.getLatestCommentsByUser(userId);
    }

    /**
     * Devuelve los comentarios más recientes de toda la aplicación.
     * 
     * URL: GET /api/comments/latest
     */
    @GetMapping("/latest")
    public List<CommentDTO> getLatestComments() {
        return commentService.getLatestComments();
    }

    /**
     * Crea un nuevo comentario.
     * 
     * El usuario autenticado es el autor del comentario.
     * 
     * URL: POST /api/comments
     */
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentDTO dto, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        System.out.println(">>> Usuario autenticado: " + currentUser.getUsername());
        return ResponseEntity.ok(commentService.createComment(dto, currentUser.getId()));
    }

    /**
     * Actualiza un comentario existente.
     * 
     * Solo el autor del comentario o un administrador podrá modificarlo.
     * 
     * URL: PUT /api/comments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id,
                                                    @RequestBody CommentDTO dto,
                                                    Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(commentService.updateComment(id, dto, user.getId()));
    }

    /**
     * Elimina un comentario.
     * 
     * Solo el autor del comentario o un administrador podrá eliminarlo.
     * 
     * URL: DELETE /api/comments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                              Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        commentService.deleteComment(id, user.getId());
        return ResponseEntity.noContent().build();
    }

}
