package com.myvideogamelist.backend.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.myvideogamelist.backend.dto.GameInListDTO;
import com.myvideogamelist.backend.dto.GameListDTO;
import com.myvideogamelist.backend.model.GameInList;
import com.myvideogamelist.backend.model.GameList;

public class GameListMapper {

	public static GameInListDTO toGameInListDTO(GameInList entity) {
	    Integer score = entity.getGame()
	        .getScores()
	        .stream()
	        .filter(s -> s.getUser().getId().equals(entity.getGameList().getUser().getId()))
	        .map(s -> s.getScore())
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

    public static GameListDTO toDTO(GameList list) {
        List<GameInListDTO> games = list.getGamesInList().stream()
            .map(GameListMapper::toGameInListDTO)
            .collect(Collectors.toList());

        return new GameListDTO(
            list.getId(),
            list.getName().name(),
            list.getUser().getId(),
            games
        );
    }
}
