package com.myvideogamelist.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.myvideogamelist.backend.dto.TranslateResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Servicio que permite traducir textos del inglés al español
 * utilizando la API pública de MyMemory.
 * 
 * Se usa en la aplicación para ofrecer la traducción de descripciones
 * de videojuegos, que originalmente están en inglés.
 */
@Service
@RequiredArgsConstructor
public class TranslationService {

    // Cliente HTTP para realizar la petición a la API de traducción
    private final RestTemplate restTemplate = new RestTemplate();

    // URL base de la API MyMemory
    private static final String TRANSLATE_API_URL = "https://api.mymemory.translated.net/get";

    /**
     * Traduce un texto del inglés al español.
     * Si el texto es muy largo, se limita a 500 caracteres para cumplir
     * con las restricciones de la API gratuita.
     * 
     * @param text texto en inglés a traducir
     * @return objeto DTO con el texto traducido
     */
    public TranslateResponseDTO translateToSpanish(String text) {
        try {
            // Limitar texto a 500 caracteres
            String limitedText = text.length() > 500 ? text.substring(0, 500) : text;

            // Construir la URL de la petición GET
            String url = UriComponentsBuilder.fromHttpUrl(TRANSLATE_API_URL)
                    .queryParam("q", limitedText)
                    .queryParam("langpair", "en|es")
                    .build()
                    .toUriString();

            // Realizar la llamada GET
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);

            // Procesar la respuesta
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String translatedText = response.getBody()
                        .path("responseData")
                        .path("translatedText")
                        .asText();
                return new TranslateResponseDTO(translatedText);
            } else {
                throw new RuntimeException("Error en la API MyMemory");
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error en la traducción: " + e.getMessage());
        }
    }
}