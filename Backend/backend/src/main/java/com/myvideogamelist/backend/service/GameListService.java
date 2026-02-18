package com.myvideogamelist.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.dto.GameListDTO;
import com.myvideogamelist.backend.mapper.GameListMapper;
import com.myvideogamelist.backend.model.GameList;
import com.myvideogamelist.backend.model.ListType;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.GameListRepository;
import com.myvideogamelist.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona las listas de los usuarios.
 * 
 * Permite:
 * - obtener listas
 * - crear listas
 * - actualizar listas
 * - eliminar listas
 * - obtener listas de un usuario
 * - crear listas predefinidas al registrar un usuario
 */
@Service
@RequiredArgsConstructor
public class GameListService {

    private final GameListRepository gameListRepository;
    private final UserRepository userRepository;

    /**
     * Devuelve todas las listas de la plataforma.
     */
    public List<GameListDTO> getAllLists() {
        return gameListRepository.findAll().stream()
                .map(GameListMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve una lista por ID.
     */
    public Optional<GameListDTO> getListById(Long id) {
        return gameListRepository.findById(id).map(GameListMapper::toDTO);
    }

    /**
     * Crea una lista nueva para un usuario.
     * 
     * En la práctica, se usa al crear listas predefinidas.
     */
    public GameListDTO createGameList(GameListDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        GameList list = new GameList();
        list.setUser(user);
        list.setName(ListType.valueOf(dto.getName().toUpperCase()));

        GameList saved = gameListRepository.save(list);
        return GameListMapper.toDTO(saved);
    }

    /**
     * Actualiza una lista existente.
     * 
     * No se usa actualmennte (las listas predefinidas no se editan).
     */
    public GameListDTO updateGameList(Long id, GameListDTO dto) {
        GameList existing = gameListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lista no encontrada"));

        if (dto.getName() != null) {
            existing.setName(ListType.valueOf(dto.getName().toUpperCase()));
        }

        return GameListMapper.toDTO(gameListRepository.save(existing));
    }

    /**
     * Elimina una lista.
     * 
     * En el modelo actual no se usa (las listas predefinidas no se eliminan).
     */
    public void deleteList(Long id) {
        gameListRepository.deleteById(id);
    }

    /**
     * Devuelve todas las listas de un usuario.
     */
    public List<GameListDTO> getListsByUserId(Long userId) {
        return gameListRepository.findByUserId(userId).stream()
                .map(GameListMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea las listas predefinidas para un usuario.
     * 
     * Se llama al registrar un nuevo usuario.
     * Las listas son:
     * - Jugados
     * - Jugando
     * - Pendientes
     */
    public void createDefaultListsForUser(User user) {
        for (ListType type : ListType.values()) {
            GameList list = new GameList();
            list.setUser(user);
            list.setName(type);
            gameListRepository.save(list);
        }
    }
}
