package com.myvideogamelist.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.dto.GameInListDTO;
import com.myvideogamelist.backend.mapper.GameInListMapper;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.GameInList;
import com.myvideogamelist.backend.model.GameList;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.GameInListRepository;
import com.myvideogamelist.backend.repository.GameListRepository;
import com.myvideogamelist.backend.repository.GameRepository;
import com.myvideogamelist.backend.security.SecurityUtils;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona los juegos en listas de los usuarios.
 * 
 * Permite:
 * - añadir juegos a listas
 * - eliminar juegos de listas
 * - obtener juegos de una lista
 * - comprobar si un juego ya está en una lista
 * - garantizar que un juego solo está en una lista a la vez
 */
@Service
@RequiredArgsConstructor
public class GameInListService {

    private final GameInListRepository gameInListRepository;
    private final GameListRepository gameListRepository;
    private final GameRepository gameRepository;

    /**
     * Añade un juego a una lista del usuario.
     * 
     * - Solo el dueño de la lista puede añadir juegos.
     * - Si el juego ya está en otra lista del usuario, se elimina de esa lista.
     * - Si el juego ya está en la lista indicada, se lanza excepción.
     */
    public GameInListDTO addGameToList(Long listId, Long gameId) {
        GameList list = gameListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Lista no encontrada"));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!list.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("No puedes añadir juegos a listas de otros usuarios.");
        }

        if (gameInListRepository.existsByGameListIdAndGameId(listId, gameId)) {
            throw new IllegalArgumentException("Este juego ya está en la lista.");
        }

        // Garantizar que el juego no esté en otras listas del usuario
        deleteIfExistsInOtherList(currentUser.getId(), gameId);

        GameInList entity = new GameInList();
        entity.setGameList(list);
        entity.setGame(game);

        return GameInListMapper.toDTO(gameInListRepository.save(entity));
    }

    /**
     * Elimina un juego de una lista.
     * 
     * - Solo el dueño de la lista puede eliminar juegos.
     */
    public void removeGameFromList(Long id) {
        GameInList gameInList = gameInListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado"));

        GameList list = gameInList.getGameList();
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!list.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("No puedes eliminar juegos de listas que no son tuyas.");
        }

        gameInListRepository.deleteById(id);
    }

    /**
     * Devuelve los juegos de una lista concreta.
     */
    public List<GameInListDTO> getGamesByListId(Long listId) {
        return gameInListRepository.findByGameListId(listId).stream()
                .map(GameInListMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Comprueba si un juego ya está en una lista concreta.
     */
    public boolean existsByListAndGame(Long listId, Long gameId) {
        return gameInListRepository.existsByGameListIdAndGameId(listId, gameId);
    }

    /**
     * Elimina el juego de cualquier otra lista del usuario (si estaba en otra lista).
     * 
     * Garantiza que un juego solo puede estar en una lista a la vez.
     */
    public void deleteIfExistsInOtherList(Long userId, Long gameId) {
        List<GameList> userLists = gameListRepository.findByUserId(userId);

        for (GameList list : userLists) {
            List<GameInList> entries = gameInListRepository.findByGameListId(list.getId());

            for (GameInList entry : entries) {
                if (entry.getGame().getId().equals(gameId)) {
                    gameInListRepository.delete(entry);
                    return;
                }
            }
        }
    }
}
