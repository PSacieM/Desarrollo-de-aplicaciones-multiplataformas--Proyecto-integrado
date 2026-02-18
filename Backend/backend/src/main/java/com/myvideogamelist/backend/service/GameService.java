package com.myvideogamelist.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.dto.GameDTO;
import com.myvideogamelist.backend.dto.TopGameDTO;
import com.myvideogamelist.backend.mapper.GameMapper;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.GameRepository;
import com.myvideogamelist.backend.repository.ScoreRepository;
import com.myvideogamelist.backend.security.SecurityUtils;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona los videojuegos de la plataforma.
 * 
 * Permite:
 * - consultar juegos
 * - buscar juegos
 * - crear, actualizar y eliminar juegos (solo admin)
 * - obtener géneros y plataformas únicas
 * - obtener el Top 100 de juegos
 * - obtener próximos lanzamientos
 * - obtener juegos aleatorios para descubrimiento
 * - calcular medias de puntuaciones
 */
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final ScoreRepository scoreRepository;

    /**
     * Devuelve todos los juegos con su media de puntuación.
     */
    public List<GameDTO> getAllGames() {
        return gameRepository.findAll().stream()
                .map(game -> {
                    Double avg = scoreRepository.findAverageScoreByGameId(game.getId());
                    return GameMapper.toDTO(game, avg);
                })
                .collect(Collectors.toList());
    }

    /**
     * Devuelve un juego por su ID, con su media de puntuación.
     */
    public Optional<GameDTO> getGameById(Long id) {
        return gameRepository.findById(id)
                .map(game -> {
                    Double avg = scoreRepository.findAverageScoreByGameId(game.getId());
                    return GameMapper.toDTO(game, avg);
                });
    }

    /**
     * Devuelve una lista de juegos aleatorios.
     */
    public List<Game> getRandomGames() {
        return gameRepository.findRandomGames();
    }

    /**
     * Busca juegos cuyo título contenga el texto indicado (case-insensitive).
     */
    public List<GameDTO> searchGamesByTitle(String title) {
        return gameRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(game -> {
                    Double avg = scoreRepository.findAverageScoreByGameId(game.getId());
                    return GameMapper.toDTO(game, avg);
                })
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo juego.
     * Solo los administradores pueden crear juegos.
     */
    public GameDTO createGame(GameDTO dto) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!currentUser.getRole().getName().equalsIgnoreCase("admin")) {
            throw new AccessDeniedException("Solo los administradores pueden crear juegos.");
        }

        // Validar que no exista un juego con el mismo título
        boolean exists = gameRepository.findByTitleContainingIgnoreCase(dto.getTitle())
                .stream()
                .anyMatch(g -> g.getTitle().equalsIgnoreCase(dto.getTitle()));

        if (exists) {
            throw new IllegalArgumentException("Ya existe un juego con ese título.");
        }

        Game game = GameMapper.toEntity(dto);
        Game saved = gameRepository.save(game);
        Double avg = scoreRepository.findAverageScoreByGameId(saved.getId());
        return GameMapper.toDTO(saved, avg);
    }

    /**
     * Actualiza los datos de un juego.
     * Solo los administradores pueden actualizar juegos.
     */
    public GameDTO updateGame(Long id, GameDTO dto) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!currentUser.getRole().getName().equalsIgnoreCase("admin")) {
            throw new AccessDeniedException("Solo los administradores pueden editar juegos.");
        }

        Game existingGame = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        // Actualizar campos que no sean nulos
        if (dto.getTitle() != null) existingGame.setTitle(dto.getTitle());
        if (dto.getGenre() != null) existingGame.setGenre(dto.getGenre());
        if (dto.getPlatform() != null) existingGame.setPlatform(dto.getPlatform());
        if (dto.getReleaseDate() != null) existingGame.setReleaseDate(dto.getReleaseDate());
        if (dto.getDescription() != null) existingGame.setDescription(dto.getDescription());
        if (dto.getCoverImage() != null) existingGame.setCoverImage(dto.getCoverImage());

        Game updated = gameRepository.save(existingGame);
        Double avg = scoreRepository.findAverageScoreByGameId(updated.getId());
        return GameMapper.toDTO(updated, avg);
    }

    /**
     * Elimina un juego.
     * Solo los administradores pueden eliminar juegos.
     */
    public void deleteGame(Long id) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!currentUser.getRole().getName().equalsIgnoreCase("admin")) {
            throw new AccessDeniedException("Solo los administradores pueden eliminar juegos.");
        }

        gameRepository.deleteById(id);
    }

    /**
     * Devuelve todos los géneros únicos de los juegos, ordenados alfabéticamente.
     */
    public List<String> getAllGenres() {
        Set<String> genreSet = new HashSet<>();

        for (Game game : gameRepository.findAll()) {
            if (game.getGenre() != null) {
                String[] genres = game.getGenre().split(", ");
                for (String genre : genres) {
                    if (!genre.trim().isEmpty()) {
                        genreSet.add(genre.trim());
                    }
                }
            }
        }

        List<String> sortedGenres = new ArrayList<>(genreSet);
        sortedGenres.sort(String::compareTo);
        return sortedGenres;
    }

    /**
     * Devuelve todas las plataformas únicas de los juegos, ordenadas alfabéticamente.
     */
    public List<String> getAllPlatforms() {
        Set<String> platformSet = new HashSet<>();

        for (Game game : gameRepository.findAll()) {
            if (game.getPlatform() != null) {
                String[] platforms = game.getPlatform().split(", ");
                for (String platform : platforms) {
                    if (!platform.trim().isEmpty()) {
                        platformSet.add(platform.trim());
                    }
                }
            }
        }

        List<String> sortedPlatforms = new ArrayList<>(platformSet);
        sortedPlatforms.sort(String::compareTo);
        return sortedPlatforms;
    }

    /**
     * Devuelve el Top 100 de juegos con mejor puntuación, filtrado por género y plataforma.
     * Si hay menos de 100 juegos con puntuación, completa con juegos sin puntuación.
     */
    public List<TopGameDTO> getTop100Games(String genre, String platform) {
        List<TopGameDTO> topRated = scoreRepository.findTopRatedGamesWithFilters(genre, platform);

        if (topRated.size() >= 100) {
            return topRated.subList(0, 100);
        }

        List<Game> fillerGames = gameRepository.findGamesWithoutScoresWithFilters(genre, platform);

        List<TopGameDTO> result = new ArrayList<>(topRated);

        for (Game game : fillerGames) {
            boolean alreadyIncluded = result.stream()
                .anyMatch(g -> g.getGameId().equals(game.getId()));

            if (!alreadyIncluded) {
                result.add(new TopGameDTO(
                    game.getId(),
                    game.getTitle(),
                    game.getGenre(),
                    game.getPlatform(),
                    game.getCoverImage(),
                    null
                ));
            }

            if (result.size() == 100) break;
        }

        return result;
    }

    /**
     * Devuelve los próximos lanzamientos, filtrados por género y plataforma, ordenados por fecha.
     */
    public List<Game> getUpcomingGames(String genre, String platform, String sortOrder) {
        List<Game> games = gameRepository.findUpcomingGamesWithFilters(
            genre != null && !genre.isEmpty() ? genre : null,
            platform != null && !platform.isEmpty() ? platform : null
        );

        if ("desc".equalsIgnoreCase(sortOrder)) {
            games.sort(Comparator.comparing(Game::getReleaseDate).reversed());
        } else {
            games.sort(Comparator.comparing(Game::getReleaseDate));
        }

        return games;
    }

    /**
     * Devuelve juegos aleatorios para la pantalla de descubrimiento, con filtros opcionales.
     */
    public List<Game> getRandomGamesForDiscover(String genre, String platform) {
        String genreValue = (genre != null && !genre.isEmpty()) ? genre : null;
        String platformValue = (platform != null && !platform.isEmpty()) ? platform : null;

        return gameRepository.findRandomGamesWithFilters(genreValue, platformValue);
    }

}
