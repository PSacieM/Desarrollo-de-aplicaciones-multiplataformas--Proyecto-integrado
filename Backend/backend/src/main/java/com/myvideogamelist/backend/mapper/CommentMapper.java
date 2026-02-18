package com.myvideogamelist.backend.mapper;

import com.myvideogamelist.backend.dto.CommentDTO;
import com.myvideogamelist.backend.model.Comment;

public class CommentMapper {
	
	public static CommentDTO toDTO(Comment comment) {
		return new CommentDTO(
				comment.getId(),
		        comment.getUser().getId(),
		        comment.getUser().getUsername(),
		        comment.getGame().getId(),
		        comment.getGame().getTitle(),
		        comment.getCommentText(),
		        comment.getCommentDate(),
		        comment.getUpdatedAt(),
		        comment.getUser().getAvatarUrl()
	        );
    }

    public static Comment toEntity(CommentDTO dto) {
        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setCommentText(dto.getCommentText());
        comment.setCommentDate(dto.getCommentDate());
        comment.setUpdatedAt(dto.getUpdatedAt());
        return comment;
    }

}
