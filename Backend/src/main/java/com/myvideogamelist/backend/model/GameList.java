package com.myvideogamelist.backend.model;


import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Lists")
public class GameList {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListType name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "gameList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameInList> gamesInList;
	
}
