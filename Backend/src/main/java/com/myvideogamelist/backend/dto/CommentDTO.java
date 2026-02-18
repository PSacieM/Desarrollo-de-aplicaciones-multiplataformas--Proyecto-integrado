package com.myvideogamelist.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long userId;
    private String username;
    private Long gameId;
    private String gameTitle;
    private String commentText;
    private LocalDateTime commentDate;
    private LocalDateTime updatedAt;
    private String avatarUrl;
}
