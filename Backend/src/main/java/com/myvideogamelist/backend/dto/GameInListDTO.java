package com.myvideogamelist.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameInListDTO {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String gameCoverImage;
    private Integer score;
}
