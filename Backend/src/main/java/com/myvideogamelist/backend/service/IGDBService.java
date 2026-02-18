package com.myvideogamelist.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myvideogamelist.backend.model.Game;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.GameRepository;
import com.myvideogamelist.backend.security.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio que permite conectar con la API externa de IGDB para importar videojuegos.
 * 
 * - Se autentica en IGDB vía OAuth2.
 * - Realiza peticiones a IGDB para obtener juegos.
 * - Guarda los juegos en la base de datos si no existen ya.
 * - Solo los administradores pueden ejecutar la importación.
 * - Realiza la importación en lotes de 100 juegos con paginación.
 * - Garantiza que no haya bucles infinitos con control de lotes vacíos.
 */
@Service
public class IGDBService {

    private final RestTemplate restTemplate;
    private final GameRepository gameRepository;

    @Value("${igdb.client.id}")
    private String clientId;

    @Value("${igdb.client.secret}")
    private String clientSecret;

    @Value("${igdb.base.url}")
    private String baseUrl;

    private String accessToken;

    @Autowired
    public IGDBService(RestTemplate restTemplate, GameRepository gameRepository) {
        this.restTemplate = restTemplate;
        this.gameRepository = gameRepository;
    }

    /**
     * Realiza la autenticación OAuth2 para obtener un token de acceso de IGDB.
     */
    private void authenticate() {
        try {
            String url = "https://id.twitch.tv/oauth2/token";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");

            String body = "client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&grant_type=client_credentials";

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                this.accessToken = extractAccessToken(response.getBody());
                System.out.println("Token obtenido correctamente.");
            } else {
                System.out.println("Error al autenticar con IGDB: " + response.getStatusCode());
                this.accessToken = null;
            }
        } catch (Exception e) {
            System.out.println("Error al autenticar en IGDB: " + e.getMessage());
            this.accessToken = null;
        }
    }

    /**
     * Extrae el token de acceso desde la respuesta JSON.
     */
    private String extractAccessToken(String responseBody) {
        try {
            String token = responseBody.split("\"access_token\":\"")[1].split("\"")[0];
            return token;
        } catch (Exception e) {
            System.out.println("Error al extraer el token: " + e.getMessage());
            return null;
        }
    }

    /**
     * Método principal para importar juegos desde IGDB.
     * 
     * - Solo lo puede ejecutar un administrador.
     * - Hace paginación con offset y limit.
     * - Evita duplicar juegos ya existentes.
     * - Para tras 3 lotes vacíos o cuando la API devuelve respuesta vacía.
     * 
     * @param query consulta en el lenguaje de consultas de IGDB.
     * @return resumen del resultado de la importación.
     */
    public String fetchAndSaveGames(String query) {

        // Seguridad: solo admin puede importar
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();
        if (!currentUser.getRole().getName().equalsIgnoreCase("ADMIN")) {
            throw new SecurityException("Solo los administradores pueden importar juegos.");
        }

        // Autenticación si es necesario
        if (accessToken == null) {
            authenticate();
        }

        if (accessToken == null) {
            return "Error: No se pudo autenticar en IGDB.";
        }

        try {
            String url = baseUrl + "games";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Client-ID", clientId);
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/json");

            int batchSize = 100;
            int offset = 0;
            int importedCount = 0;
            int emptyBatchCount = 0;

            // Obtener títulos existentes para evitar duplicados
            List<String> existingTitles = gameRepository.findAll()
                    .stream()
                    .map(Game::getTitle)
                    .collect(Collectors.toList());

            while (true) {
                // Construir la consulta paginada
                String paginatedQuery = query + "; limit " + batchSize + "; offset " + offset + ";";
                System.out.println("Query Enviado a IGDB: " + paginatedQuery);

                HttpEntity<String> entity = new HttpEntity<>(paginatedQuery, headers);
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

                if (!response.getStatusCode().is2xxSuccessful()) {
                    System.out.println("Error en la respuesta de IGDB: " + response.getStatusCode());
                    return "Error: La API de IGDB respondió con un error. Código: " + response.getStatusCode();
                }

                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());

                // Si la respuesta está vacía → no hay más juegos
                if (jsonResponse.isEmpty()) {
                    System.out.println("No hay más juegos para importar.");
                    break;
                }

                int batchImportedCount = 0;

                // Recorrer juegos devueltos
                for (JsonNode gameNode : jsonResponse) {
                    try {
                        String title = gameNode.get("name").asText();

                        // Saltar juegos ya existentes
                        if (existingTitles.contains(title)) {
                            System.out.println("Juego ya existente: " + title);
                            continue;
                        }

                        // Crear objeto Game
                        Game game = new Game();
                        game.setTitle(title);
                        game.setGenre(extractGenres(gameNode));
                        game.setReleaseDate(parseReleaseDate(gameNode));
                        game.setPlatform(extractPlatforms(gameNode));
                        game.setDescription(extractDescription(gameNode));
                        game.setCoverImage(extractCoverImage(gameNode));

                        // Guardar en la BBDD
                        gameRepository.save(game);
                        existingTitles.add(title);
                        System.out.println("Juego guardado: " + game.getTitle());
                        batchImportedCount++;
                    } catch (Exception e) {
                        System.out.println("Error al guardar el juego: " + e.getMessage());
                    }
                }

                // Control de lotes vacíos consecutivos
                if (batchImportedCount == 0) {
                    emptyBatchCount++;
                    System.out.println("Lote vacío. Intentos consecutivos sin nuevos juegos: " + emptyBatchCount);
                } else {
                    emptyBatchCount = 0;
                }

                // Parar tras 3 lotes vacíos consecutivos
                if (emptyBatchCount >= 3) {
                    System.out.println("Tres lotes consecutivos sin nuevos juegos. Finalizando.");
                    break;
                }

                importedCount += batchImportedCount;
                offset += batchSize;
            }

            System.out.println("Importación completada. Juegos importados: " + importedCount);
            return "Juegos importados correctamente. Total: " + importedCount;

        } catch (Exception e) {
            System.out.println("Error al importar juegos: " + e.getMessage());
            return "Error al importar juegos: " + e.getMessage();
        }
    }

    /**
     * Extrae las plataformas de un juego.
     */
    private String extractPlatforms(JsonNode gameNode) {
        if (gameNode.has("platforms")) {
            StringBuilder platforms = new StringBuilder();
            for (JsonNode platform : gameNode.get("platforms")) {
                if (platforms.length() > 0) platforms.append(", ");
                platforms.append(platform.get("name").asText());
            }
            return platforms.toString();
        }
        return "Sin plataforma";
    }

    /**
     * Extrae la descripción de un juego.
     */
    private String extractDescription(JsonNode gameNode) {
        if (gameNode.has("summary")) {
            return gameNode.get("summary").asText();
        }
        return "Sin descripción";
    }

    /**
     * Extrae la URL de la portada de un juego.
     */
    private String extractCoverImage(JsonNode gameNode) {
        if (gameNode.has("cover")) {
            return "https://images.igdb.com/igdb/image/upload/t_cover_big/" + gameNode.get("cover").get("image_id").asText() + ".jpg";
        }
        return "https://via.placeholder.com/150";
    }

    /**
     * Extrae los géneros de un juego.
     */
    private String extractGenres(JsonNode gameNode) {
        if (gameNode.has("genres")) {
            StringBuilder genres = new StringBuilder();
            for (JsonNode genre : gameNode.get("genres")) {
                if (genres.length() > 0) genres.append(", ");
                genres.append(genre.get("name").asText());
            }
            return genres.toString();
        }
        return "Sin género";
    }

    /**
     * Convierte la fecha de lanzamiento a LocalDate.
     */
    private LocalDate parseReleaseDate(JsonNode gameNode) {
        if (gameNode.has("release_dates") && gameNode.get("release_dates").size() > 0) {
            JsonNode dateNode = gameNode.get("release_dates").get(0);
            if (dateNode.has("date")) {
                long timestamp = dateNode.get("date").asLong();
                return LocalDate.ofEpochDay(timestamp / 86400L);
            }
        }
        return null;
    }

}

