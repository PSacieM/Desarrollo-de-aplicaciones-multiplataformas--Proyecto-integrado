package com.myvideogamelist.backend.mapper;

import com.myvideogamelist.backend.dto.ScoreDTO;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.Score;
import com.myvideogamelist.backend.model.User;

public class ScoreMapper {

	public static ScoreDTO toDTO(Score score) {
        return new ScoreDTO(
            score.getId(),
            score.getGame().getId(),
            score.getUser().getId(),
            score.getScore()
        );
    }

    public static Score toEntity(ScoreDTO dto, User user, Game game) {
        Score score = new Score();
        score.setId(dto.getId());
        score.setScore(dto.getScore());
        score.setUser(user);
        score.setGame(game);
        return score;
    }
}
