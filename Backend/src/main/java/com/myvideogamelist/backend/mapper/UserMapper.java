package com.myvideogamelist.backend.mapper;

import com.myvideogamelist.backend.dto.AdminUserDTO;
import com.myvideogamelist.backend.dto.PublicUserDTO;
import com.myvideogamelist.backend.dto.UserProfileDTO;
import com.myvideogamelist.backend.dto.UserRegisterDTO;
import com.myvideogamelist.backend.model.User;

public class UserMapper {
	
	public static UserProfileDTO toUserProfileDTO(User user) {
        return new UserProfileDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getRole().getName()
        );
    }
    
    public static User toEntity(UserRegisterDTO dto) {
        if (dto == null) return null;
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        return user;
    }
    
    public static PublicUserDTO toPublicDTO(User user) {
        return new PublicUserDTO(
            user.getId(),
            user.getUsername(),
            user.getAvatarUrl()
        );
    }
    
    public static AdminUserDTO toAdminDTO(User user) {
        return new AdminUserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getRole().getName()
        );
    }

}
