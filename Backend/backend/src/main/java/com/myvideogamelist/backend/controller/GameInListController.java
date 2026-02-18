package com.myvideogamelist.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.dto.GameInListDTO;
import com.myvideogamelist.backend.service.GameInListService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con la gestión de juegos en listas personalizadas del usuario.
 * 
 * Permite consultar los juegos de cada lista, añadir juegos a listas, eliminar juegos de listas
 * y comprobar si un juego ya está en una lista concreta.
 */
@RestController
@RequestMapping("/api/games-in-lists")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GameInListController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de juegos en listas de usuario.
     */
    private final GameInListService gameInListService;

    /**
     * Devuelve todos los juegos que contiene una lista concreta.
     * 
     * URL: GET /api/games-in-lists/list/{listId}
     * 
     * @param listId ID de la lista.
     * @return lista de juegos en la lista especificada.
     */
    @GetMapping("/list/{listId}")
    public ResponseEntity<List<GameInListDTO>> getGamesByListId(@PathVariable Long listId) {
        return ResponseEntity.ok(gameInListService.getGamesByListId(listId));
    }

    /**
     * Añade un juego a una lista concreta.
     * 
     * URL: POST /api/games-in-lists
     * 
     * @param listId ID de la lista.
     * @param gameId ID del juego que se desea añadir.
     * @return el DTO del juego añadido a la lista.
     */
    @PostMapping
    public ResponseEntity<GameInListDTO> addGameToList(@RequestParam Long listId, @RequestParam Long gameId) {
        return ResponseEntity.ok(gameInListService.addGameToList(listId, gameId));
    }

    /**
     * Elimina un juego de una lista concreta.
     * 
     * URL: DELETE /api/games-in-lists/{id}
     * 
     * @param id ID de la relación GameInList (no del juego ni de la lista).
     * @return respuesta sin contenido (204 No Content).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeGameFromList(@PathVariable Long id) {
        gameInListService.removeGameFromList(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Comprueba si un juego ya está en una lista concreta.
     * 
     * URL: GET /api/games-in-lists/exists
     * 
     * @param listId ID de la lista.
     * @param gameId ID del juego.
     * @return true si el juego está en la lista, false en caso contrario.
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsInList(@RequestParam Long listId, @RequestParam Long gameId) {
        return ResponseEntity.ok(gameInListService.existsByListAndGame(listId, gameId));
    }
}
