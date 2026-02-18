package com.myvideogamelist.backend.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Clase de configuración que define beans relacionados con la integración de APIs externas.
 * En este caso, configura un bean RestTemplate que se utilizará para realizar peticiones HTTP
 * a la API de IGDB.
 */
@Configuration
public class IGDBConfig {

    /**
     * Crea e instancia un bean RestTemplate.
     * Este bean estará disponible en el contexto de Spring y podrá ser inyectado
     * en servicios que necesiten realizar peticiones HTTP.
     *
     * @param builder el RestTemplateBuilder proporcionado por Spring Boot para facilitar la configuración.
     * @return una instancia de RestTemplate.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
}