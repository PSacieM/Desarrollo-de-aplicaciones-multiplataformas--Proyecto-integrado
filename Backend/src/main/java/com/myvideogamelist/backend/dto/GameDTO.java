package com.myvideogamelist.backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
	
	private Long id;
    private String title;
    private String description;
    private String genre;
    private String platform;
    private LocalDate releaseDate;
    private String coverImage;
    private Double averageScore;

}
