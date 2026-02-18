package com.myvideogamelist.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myvideogamelist.backend.model.GameInList;

/**
 * Repositorio JPA para la entidad GameInList.
 * 
 * Gestiona la relación entre juegos y listas de usuario.
 * Permite consultar qué juegos hay en cada lista y comprobar si un juego ya está en una lista concreta.
 */
public interface GameInListRepository extends JpaRepository<GameInList, Long> {

    /**
     * Devuelve todos los juegos que pertenecen a una lista concreta.
     * 
     * @param gameListId ID de la lista.
     * @return lista de relaciones GameInList (juegos en la lista).
     */
    List<GameInList> findByGameListId(Long gameListId);

    /**
     * Comprueba si un juego ya está en una lista concreta.
     * 
     * @param gameListId ID de la lista.
     * @param gameId ID del juego.
     * @return true si el juego ya está en la lista, false en caso contrario.
     */
    boolean existsByGameListIdAndGameId(Long gameListId, Long gameId);
}
