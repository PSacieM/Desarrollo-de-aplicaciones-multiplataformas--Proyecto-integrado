package com.myvideogamelist.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.dto.GameDTO;
import com.myvideogamelist.backend.dto.TopGameDTO;
import com.myvideogamelist.backend.mapper.GameMapper;
import com.myvideogamelist.backend.service.GameService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con los videojuegos.
 * 
 * Permite consultar juegos, obtener rankings, buscar por título,
 * filtrar por género y plataforma, y gestionar (crear/editar/eliminar) juegos.
 */
@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GameController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de videojuegos.
     */
    private final GameService gameService;

    /**
     * Devuelve todos los videojuegos de la base de datos.
     * 
     * URL: GET /api/games
     */
    @GetMapping
    public List<GameDTO> getAllGames() {
        return gameService.getAllGames();
    }

    /**
     * Devuelve un videojuego concreto por su ID.
     * 
     * URL: GET /api/games/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return gameService.getGameById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Devuelve todos los géneros disponibles en la base de datos.
     * 
     * URL: GET /api/games/genres
     */
    @GetMapping("/genres")
    public List<String> getAllGenres() {
        return gameService.getAllGenres();
    }

    /**
     * Devuelve todas las plataformas disponibles en la base de datos.
     * 
     * URL: GET /api/games/platforms
     */
    @GetMapping("/platforms")
    public List<String> getAllPlatforms() {
        return gameService.getAllPlatforms();
    }

    /**
     * Devuelve una lista de juegos aleatorios.
     * 
     * URL: GET /api/games/random
     */
    @GetMapping("/random")
    public List<GameDTO> getRandomGames() {
        return gameService.getRandomGames().stream()
            .map(GameMapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Devuelve el Top 100 de juegos mejor valorados.
     * 
     * Permite filtrar por género y plataforma.
     * 
     * URL: GET /api/games/top100
     */
    @GetMapping("/top100")
    public List<TopGameDTO> getTop100Games(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform) {
        return gameService.getTop100Games(genre, platform);
    }

    /**
     * Devuelve los próximos lanzamientos de videojuegos.
     * 
     * Permite filtrar por género y plataforma, y ordenar por fecha.
     * 
     * URL: GET /api/games/upcoming
     */
    @GetMapping("/upcoming")
    public List<GameDTO> getUpcomingGames(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        return gameService.getUpcomingGames(genre, platform, sortOrder).stream()
                .map(GameMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve una lista de juegos aleatorios para la sección de "Descubrir".
     * 
     * Permite filtrar por género y plataforma.
     * 
     * URL: GET /api/games/discover
     */
    @GetMapping("/discover")
    public List<GameDTO> getRandomGamesForDiscover(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform) {

        return gameService.getRandomGamesForDiscover(genre, platform).stream()
            .map(GameMapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo videojuego en la base de datos.
     * 
     * URL: POST /api/games
     * 
     * Nota: esta operación está reservada para usuarios administradores (controlado en el service).
     */
    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO dto) {
        return ResponseEntity.ok(gameService.createGame(dto));
    }

    /**
     * Actualiza los datos de un videojuego existente.
     * 
     * URL: PUT /api/games/{id}
     * 
     * Nota: esta operación está reservada para usuarios administradores (controlado en el service).
     */
    @PutMapping("/{id}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long id, @RequestBody GameDTO dto) {
        return ResponseEntity.ok(gameService.updateGame(id, dto));
    }

    /**
     * Elimina un videojuego de la base de datos.
     * 
     * URL: DELETE /api/games/{id}
     * 
     * Nota: esta operación está reservada para usuarios administradores (controlado en el service).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca videojuegos por título.
     * 
     * URL: GET /api/games/search
     */
    @GetMapping("/search")
    public List<GameDTO> searchGamesByTitle(@RequestParam String title) {
        return gameService.searchGamesByTitle(title);
    }

}
