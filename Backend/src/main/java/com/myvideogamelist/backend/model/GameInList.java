package com.myvideogamelist.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Games_in_Lists")
public class GameInList {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "list_id", nullable = false)
    private GameList gameList;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

}
