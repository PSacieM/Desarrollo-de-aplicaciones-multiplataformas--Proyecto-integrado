package com.myvideogamelist.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myvideogamelist.backend.model.GameList;

/**
 * Repositorio JPA para la entidad GameList.
 * 
 * Gestiona las listas de juegos de los usuarios (Jugados, Jugando, Pendientes).
 * 
 * Cada usuario tiene tres listas predefinidas que se crean automáticamente al registrarse.
 */
public interface GameListRepository extends JpaRepository<GameList, Long> {

    /**
     * Devuelve todas las listas que pertenecen a un usuario concreto.
     * 
     * @param userId ID del usuario.
     * @return lista de GameList asociadas al usuario.
     */
    List<GameList> findByUserId(Long userId);
}
