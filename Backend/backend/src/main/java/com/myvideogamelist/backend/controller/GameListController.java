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

import com.myvideogamelist.backend.dto.GameListDTO;
import com.myvideogamelist.backend.service.GameListService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con las listas de juegos de los usuarios.
 * 
 * En el sistema MyVideogameList, cada usuario dispone de tres listas predefinidas:
 * - Jugados
 * - Jugando
 * - Pendientes
 * 
 * Estas listas se crean automáticamente al registrar un usuario.
 * 
 * Este controlador permite obtener las listas de un usuario.
 */
@RestController
@RequestMapping("/api/lists")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GameListController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de listas de juegos.
     */
    private final GameListService gameListService;

    /**
     * Devuelve todas las listas de la base de datos.
     * 
     * URL: GET /api/lists
     */
    @GetMapping
    public List<GameListDTO> getAllLists() {
        return gameListService.getAllLists();
    }

    /**
     * Devuelve una lista concreta por su ID.
     * 
     * URL: GET /api/lists/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameListDTO> getListById(@PathVariable Long id) {
        return gameListService.getListById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea una nueva lista.
     * 
     * URL: POST /api/lists
     * 
     * Nota: en el sistema actual, las listas se crean automáticamente al registrar un usuario.
     * Este endpoint queda disponible para posibles casos especiales o gestión administrativa.
     */
    @PostMapping
    public ResponseEntity<GameListDTO> createGameList(@RequestBody GameListDTO dto) {
        return ResponseEntity.ok(gameListService.createGameList(dto));
    }

    /**
     * Actualiza los datos de una lista.
     * 
     * URL: PUT /api/lists/{id}
     * 
     * Nota: en el sistema actual, las listas predefinidas no se modifican.
     */
    @PutMapping("/{id}")
    public ResponseEntity<GameListDTO> updateGameList(@PathVariable Long id, @RequestBody GameListDTO dto) {
        return ResponseEntity.ok(gameListService.updateGameList(id, dto));
    }

    /**
     * Elimina una lista.
     * 
     * URL: DELETE /api/lists/{id}
     * 
     * Nota: esta operación debería estar restringida a un administrador o al propio sistema (por ejemplo al eliminar un usuario).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        gameListService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Devuelve las listas de un usuario concreto (Jugados, Jugando, Pendientes).
     * 
     * URL: GET /api/lists/user/{userId}
     * 
     * Es el endpoint utilizado en el frontend para mostrar las listas en el perfil del usuario o en "Mis Listas".
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GameListDTO>> getListsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(gameListService.getListsByUserId(userId));
    }
}
