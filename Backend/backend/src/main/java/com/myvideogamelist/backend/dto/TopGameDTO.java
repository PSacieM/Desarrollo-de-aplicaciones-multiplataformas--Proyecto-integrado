package com.myvideogamelist.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopGameDTO {
    private Long gameId;
    private String gameTitle;
    private String genre;
    private String platform;
    private String coverImage;
    private Double averageScore;
}
