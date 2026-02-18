package com.myvideogamelist.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.myvideogamelist.backend.model.Game;

/**
 * Repositorio JPA para la entidad Game.
 * 
 * Gestiona el acceso a los datos de los videojuegos.
 * 
 * Permite realizar búsquedas, obtener juegos aleatorios, consultar próximos lanzamientos y aplicar filtros por género y plataforma.
 */
public interface GameRepository extends JpaRepository<Game, Long> {

    /**
     * Busca juegos cuyo título contenga el texto de búsqueda (ignorando mayúsculas/minúsculas).
     * 
     * Se utiliza en el buscador de la aplicación.
     */
    List<Game> findByTitleContainingIgnoreCase(String title);

    /**
     * Devuelve un juego por su título exacto.
     * 
     * Se utiliza para comprobar si un juego ya existe antes de importarlo.
     */
    Optional<Game> findByTitle(String title);

    /**
     * Comprueba si existe un juego con el título especificado.
     * 
     * Se utiliza para evitar duplicados al importar juegos.
     */
    boolean existsByTitle(String title);

    /**
     * Devuelve 3 juegos aleatorios.
     * 
     * Se utiliza en la HomePage para mostrar juegos destacados aleatorios.
     */
    @Query(value = "SELECT * FROM games ORDER BY RAND() LIMIT 3", nativeQuery = true)
    List<Game> findRandomGames();

    /**
     * Devuelve juegos que no tienen ninguna puntuación.
     * 
     * Se puede aplicar filtro por género y plataforma.
     * 
     * Se utiliza en la sección "Descubrir juegos".
     */
    @Query("SELECT g FROM Game g WHERE g.id NOT IN (SELECT DISTINCT s.game.id FROM Score s) " +
           "AND (:genre IS NULL OR g.genre = :genre) AND (:platform IS NULL OR g.platform = :platform)")
    List<Game> findGamesWithoutScoresWithFilters(@Param("genre") String genre, @Param("platform") String platform);

    /**
     * Devuelve los juegos con fecha de lanzamiento futura (próximos lanzamientos).
     * 
     * Se puede aplicar filtro por género y plataforma.
     * 
     * Los resultados se ordenan por fecha de lanzamiento (más cercanos primero).
     */
    @Query("SELECT g FROM Game g WHERE g.releaseDate > CURRENT_DATE " +
           "AND (:genre IS NULL OR g.genre = :genre) " +
           "AND (:platform IS NULL OR g.platform = :platform) " +
           "ORDER BY g.releaseDate ASC")
    List<Game> findUpcomingGamesWithFilters(
            @Param("genre") String genre,
            @Param("platform") String platform);

    /**
     * Devuelve 10 juegos aleatorios, con posibilidad de filtrar por género y plataforma.
     * 
     * Se utiliza en la página "Descubrir juegos".
     */
    @Query(value = "SELECT * FROM games " +
            "WHERE (:genre IS NULL OR genre = :genre) " +
            "AND (:platform IS NULL OR platform = :platform) " +
            "ORDER BY RAND() LIMIT 10", nativeQuery = true)
    List<Game> findRandomGamesWithFilters(
            @Param("genre") String genre,
            @Param("platform") String platform);

}
