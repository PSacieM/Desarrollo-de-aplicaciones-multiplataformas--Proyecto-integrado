package com.myvideogamelist.backend.mapper;

import com.myvideogamelist.backend.dto.GameDTO;
import com.myvideogamelist.backend.model.Game;

public class GameMapper {
	
	public static GameDTO toDTO(Game game, Double avgScore) {
        if (game == null) return null;

        return new GameDTO(
            game.getId(),
            game.getTitle(),
            game.getDescription(),
            game.getGenre(),
            game.getPlatform(),
            game.getReleaseDate(),
            game.getCoverImage(),
            avgScore
        );
    }

    public static Game toEntity(GameDTO dto) {
        if (dto == null) return null;

        Game game = new Game();
        game.setId(dto.getId());
        game.setTitle(dto.getTitle());
        game.setDescription(dto.getDescription());
        game.setGenre(dto.getGenre());
        game.setPlatform(dto.getPlatform());
        game.setReleaseDate(dto.getReleaseDate());
        game.setCoverImage(dto.getCoverImage());
        return game;
    }
    
    public static GameDTO toDTO(Game game) {
        return toDTO(game, null);
    }

}
