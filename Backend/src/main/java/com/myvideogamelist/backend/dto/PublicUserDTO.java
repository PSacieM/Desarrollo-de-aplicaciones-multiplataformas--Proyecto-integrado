package com.myvideogamelist.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublicUserDTO {
    private Long id;
    private String username;
    private String avatarUrl;
}
