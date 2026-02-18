package com.myvideogamelist.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDTO {
    private Long id;
    private Long gameId;
    private Long userId;
    private Integer score;
}
