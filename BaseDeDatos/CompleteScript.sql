CREATE DATABASE myvideogamelist;
USE myvideogamelist;

-- Tabla de Roles
CREATE TABLE Roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- Tabla de Usuarios
CREATE TABLE Users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE
);

-- Tabla de Videojuegos
CREATE TABLE Games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    release_date DATE,
    genre VARCHAR(50),
    platform VARCHAR(50),
    description TEXT,
    cover_image VARCHAR(255)
);

-- Tabla de Listas
CREATE TABLE Lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name ENUM('Jugados', 'Jugando', 'Pendientes') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tabla intermedia para Juegos en Listas (Relación N:M)
CREATE TABLE Games_in_Lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES Lists(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

-- Tabla de Comentarios
CREATE TABLE Comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

-- Tabla de Puntuaciones
CREATE TABLE Scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

-- Insertar roles
INSERT INTO Roles (name) VALUES
('user'),
('admin');

-- Insertar usuarios
INSERT INTO Users (username, email, password_hash, avatar_url, role_id) VALUES
('gamer1', 'gamer1@example.com', 'hashedpass1', 'avatar1.jpg', 1),
('gamer2', 'gamer2@example.com', 'hashedpass2', 'avatar2.jpg', 1),
('admin', 'admin@example.com', 'hashedadmin', 'admin.jpg', 2);

-- Insertar videojuegos
INSERT INTO Games (title, release_date, genre, platform, description, cover_image) VALUES
('The Legend of Zelda: Breath of the Wild', '2017-03-03', 'Aventura', 'Nintendo Switch', 'Un juego de mundo abierto aclamado por la crítica.', 'zelda.jpg'),
('God of War Ragnarok', '2022-11-09', 'Acción', 'PlayStation 5', 'Secuela del exitoso God of War de 2018.', 'gow.jpg'),
('Elden Ring', '2022-02-25', 'RPG', 'PC', 'Una aventura desafiante desarrollada por FromSoftware.', 'eldenring.jpg'),
('Hollow Knight', '2017-02-24', 'Metroidvania', 'PC', 'Explora un mundo subterráneo en este juego independiente.', 'hollow.jpg'),
('Red Dead Redemption 2', '2018-10-26', 'Aventura', 'PC', 'Una epopeya del lejano oeste por Rockstar Games.', 'rdr2.jpg');

-- Insertar listas (3 por usuario)
INSERT INTO Lists (user_id, name) VALUES
(1, 'Jugados'),
(1, 'Jugando'),
(1, 'Pendientes'),
(2, 'Jugados'),
(2, 'Jugando'),
(2, 'Pendientes'),
(3, 'Jugados'),
(3, 'Jugando'),
(3, 'Pendientes');

-- Insertar juegos en listas (ejemplos variados)
INSERT INTO Games_in_Lists (list_id, game_id) VALUES
(1, 1),  -- Zelda en Jugados del usuario 1
(2, 2),  -- Ragnarok en Jugando del usuario 1
(4, 3),  -- Elden Ring en Jugados del usuario 2
(5, 1),  -- Zelda en Jugando del usuario 2
(7, 4);  -- Hollow Knight en Jugados del admin

-- Insertar comentarios
INSERT INTO Comments (user_id, game_id, comment_text) VALUES
(1, 1, 'Una obra maestra, no puedo dejar de jugarlo.'),
(2, 3, 'Muy desafiante, pero increíblemente adictivo.'),
(3, 2, 'La historia me ha atrapado por completo.');

-- Insertar puntuaciones
INSERT INTO Scores (user_id, game_id, score) VALUES
(1, 1, 10),
(2, 3, 9),
(3, 2, 8);