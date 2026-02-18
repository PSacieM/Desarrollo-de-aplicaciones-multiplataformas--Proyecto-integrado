package com.myvideogamelist.backend.mapper;

import com.myvideogamelist.backend.dto.GameInListDTO;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.GameInList;
import com.myvideogamelist.backend.model.GameList;

public class GameInListMapper {

	public static GameInListDTO toDTO(GameInList entity) {
		Integer score = entity.getGame()
			    .getScores()
			    .stream()
			    .filter(s -> s.getUser().getId().equals(entity.getGameList().getUser().getId()))
			    .map(s -> s.getScore())  // ya es Integer
			    .findFirst()
			    .orElse(null);

        return new GameInListDTO(
            entity.getId(),
            entity.getGame().getId(),
            entity.getGame().getTitle(),
            entity.getGame().getCoverImage(),
            score
        );
    }

    public static GameInList toEntity(Long listId, Long gameId, GameList list, Game game) {
        GameInList entity = new GameInList();
        entity.setGameList(list);
        entity.setGame(game);
        return entity;
    }
}

