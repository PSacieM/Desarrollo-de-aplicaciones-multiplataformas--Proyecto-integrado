package com.myvideogamelist.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.dto.GameRatingDTO;
import com.myvideogamelist.backend.dto.ScoreDTO;
import com.myvideogamelist.backend.service.ScoreService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con las puntuaciones de los juegos.
 * 
 * Permite a los usuarios puntuar juegos, consultar puntuaciones, ver las medias de valoración y obtener rankings de juegos mejor valorados.
 */
@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ScoreController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de puntuaciones.
     */
    private final ScoreService scoreService;

    /**
     * Devuelve todas las puntuaciones de la base de datos.
     * 
     * URL: GET /api/scores/all
     */
    @GetMapping("/all")
    public List<ScoreDTO> getAllScores() {
        return scoreService.getAllScores();
    }

    /**
     * Devuelve una puntuación concreta por su ID.
     * 
     * URL: GET /api/scores/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScoreDTO> getScoreById(@PathVariable Long id) {
        return scoreService.getScoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Devuelve la puntuación media de un juego.
     * 
     * URL: GET /api/scores/game/{gameId}/average
     */
    @GetMapping("/game/{gameId}/average")
    public ResponseEntity<Double> getAverageScore(@PathVariable Long gameId) {
        return ResponseEntity.ok(scoreService.getAverageScoreByGame(gameId));
    }

    /**
     * Devuelve todas las puntuaciones realizadas por un usuario concreto.
     * 
     * URL: GET /api/scores/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public List<ScoreDTO> getAllScoresByUser(@PathVariable Long userId) {
        return scoreService.getAllScoresByUser(userId);
    }

    /**
     * Devuelve las últimas puntuaciones realizadas por un usuario concreto.
     * 
     * URL: GET /api/scores/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public List<ScoreDTO> getLatestScoresByUser(@PathVariable Long userId) {
        return scoreService.getLatestScoresByUser(userId);
    }

    /**
     * Devuelve el ranking de juegos mejor valorados.
     * 
     * URL: GET /api/scores/top-rated
     */
    @GetMapping("/top-rated")
    public List<GameRatingDTO> getTopRatedGames() {
        return scoreService.getTopRatedGames();
    }

    /**
     * Devuelve la puntuación que un usuario concreto ha dado a un juego concreto.
     * 
     * URL: GET /api/scores/user/{userId}/game/{gameId}
     */
    @GetMapping("/user/{userId}/game/{gameId}")
    public ResponseEntity<ScoreDTO> getUserScoreForGame(
            @PathVariable Long userId, 
            @PathVariable Long gameId) {

        return scoreService.getUserScoreForGame(userId, gameId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea una nueva puntuación para un juego.
     * 
     * URL: POST /api/scores
     */
    @PostMapping
    public ResponseEntity<ScoreDTO> createScore(@RequestBody ScoreDTO dto) {
        return ResponseEntity.ok(scoreService.createScore(dto));
    }

    /**
     * Actualiza una puntuación existente.
     * 
     * URL: PUT /api/scores/{id}
     * 
     * Nota: solo el autor de la puntuación puede modificarla (controlado en el service).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ScoreDTO> updateScore(@PathVariable Long id, @RequestBody ScoreDTO dto) {
        return ResponseEntity.ok(scoreService.updateScore(id, dto));
    }

    /**
     * Elimina una puntuación.
     * 
     * URL: DELETE /api/scores/{id}
     * 
     * Nota: solo el autor de la puntuación o un administrador pueden eliminarla (controlado en el service).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScore(@PathVariable Long id) {
        scoreService.deleteScore(id);
        return ResponseEntity.noContent().build();
    }

}
