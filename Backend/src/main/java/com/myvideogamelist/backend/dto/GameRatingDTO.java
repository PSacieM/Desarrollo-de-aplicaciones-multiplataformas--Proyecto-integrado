package com.myvideogamelist.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameRatingDTO {
	
	private Long gameId;
    private String gameTitle;
    private Double averageScore;
    private String coverImage;

}