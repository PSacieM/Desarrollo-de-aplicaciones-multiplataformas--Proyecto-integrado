package com.myvideogamelist.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Clase de configuración que define la política CORS de la aplicación.
 * 
 * CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que aplicaciones frontend
 * en dominios distintos (por ejemplo React en http://localhost:3000) puedan realizar peticiones
 * al backend (por ejemplo en http://localhost:8080).
 * 
 * Sin esta configuración, los navegadores bloquearían por defecto este tipo de peticiones por motivos de seguridad.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Define un bean WebMvcConfigurer que configura la política CORS.
     * 
     * Se permite el acceso desde http://localhost:3000, que es donde corre el frontend durante el desarrollo.
     * 
     * Se permiten los métodos GET, POST, PUT, DELETE y OPTIONS.
     * 
     * Se permiten los headers Authorization y Content-Type, y se expone Authorization en las respuestas.
     * 
     * No se permite el envío de credenciales (cookies, autenticación con withCredentials, etc).
     *
     * @return una instancia de WebMvcConfigurer con la configuración CORS personalizada.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("Authorization", "Content-Type")
                        .exposedHeaders("Authorization")
                        .allowCredentials(false);
            }
        };
    }
}