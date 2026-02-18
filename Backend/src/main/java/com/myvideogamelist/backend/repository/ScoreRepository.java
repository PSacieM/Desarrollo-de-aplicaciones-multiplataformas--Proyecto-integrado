package com.myvideogamelist.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.myvideogamelist.backend.dto.TopGameDTO;
import com.myvideogamelist.backend.model.Score;

/**
 * Repositorio JPA para la entidad Score.
 * 
 * Gestiona el acceso a las puntuaciones de los juegos.
 * 
 * Permite calcular la media de puntuaciones, obtener puntuaciones por usuario, consultar puntuaciones recientes
 * y obtener rankings de los juegos mejor valorados.
 */
public interface ScoreRepository extends JpaRepository<Score, Long> {

    /**
     * Devuelve la puntuación media de un juego.
     * 
     * @param gameId ID del juego.
     * @return media de las puntuaciones del juego.
     */
    @Query("SELECT AVG(s.score) FROM Score s WHERE s.game.id = :gameId")
    Double findAverageScoreByGameId(@Param("gameId") Long gameId);

    /**
     * Devuelve todas las puntuaciones realizadas por un usuario concreto.
     * 
     * @param userId ID del usuario.
     * @return lista de puntuaciones del usuario.
     */
    List<Score> findByUserId(Long userId);

    /**
     * Devuelve las 3 últimas puntuaciones realizadas por un usuario concreto.
     * 
     * @param userId ID del usuario.
     * @return lista de las 3 puntuaciones más recientes.
     */
    @Query("SELECT s FROM Score s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<Score> findTop3LatestScoresByUser(@Param("userId") Long userId);

    /**
     * Devuelve la puntuación que un usuario concreto ha dado a un juego concreto, si existe.
     * 
     * @param userId ID del usuario.
     * @param gameId ID del juego.
     * @return Optional<Score> que contiene la puntuación si existe.
     */
    Optional<Score> findByUserIdAndGameId(Long userId, Long gameId);

    /**
     * Devuelve la media de puntuaciones de todos los juegos (sin filtros).
     * 
     * Devuelve una lista de arrays de objetos con:
     * - ID del juego
     * - Título
     * - Imagen de portada
     * - Media de puntuación
     * 
     * Se usaba para calcular el ranking de juegos mejor valorados.
     */
    @Query("SELECT g.id, g.title, g.coverImage, AVG(s.score) " +
           "FROM Score s JOIN s.game g " +
           "GROUP BY g.id, g.title, g.coverImage " +
           "ORDER BY AVG(s.score) DESC")
    List<Object[]> findAverageScoresForAllGames();

    /**
     * Devuelve el Top juegos mejor valorados, con posibilidad de aplicar filtros por género y plataforma.
     * 
     * Devuelve directamente una lista de TopGameDTO.
     * 
     * Se utiliza en la página "Top 100 juegos".
     * 
     * @param genre género a filtrar (opcional).
     * @param platform plataforma a filtrar (opcional).
     * @return lista de TopGameDTO con los juegos mejor valorados.
     */
    @Query("SELECT new com.myvideogamelist.backend.dto.TopGameDTO(" +
           "g.id, g.title, g.genre, g.platform, g.coverImage, AVG(s.score)) " +
           "FROM Score s JOIN s.game g " +
           "WHERE (:genre IS NULL OR g.genre = :genre) AND (:platform IS NULL OR g.platform = :platform) " +
           "GROUP BY g.id, g.title, g.genre, g.platform, g.coverImage " +
           "ORDER BY AVG(s.score) DESC")
    List<TopGameDTO> findTopRatedGamesWithFilters(@Param("genre") String genre, @Param("platform") String platform);
}
