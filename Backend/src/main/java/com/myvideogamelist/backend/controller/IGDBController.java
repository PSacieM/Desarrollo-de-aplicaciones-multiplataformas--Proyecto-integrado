package com.myvideogamelist.backend.controller;

import com.myvideogamelist.backend.service.IGDBService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST que gestiona la importación manual de juegos desde la API de IGDB.
 * 
 * Este endpoint se ha utilizado únicamente una vez desde Postman para poblar la base de datos inicial de la aplicación.
 * 
 * No es accesible desde el frontend ni por los usuarios de la aplicación. 
 * 
 * En condiciones normales, este endpoint no se vuelve a utilizar salvo que se quiera realizar una nueva importación puntual de juegos.
 */
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class IGDBController {

    /**
     * Servicio que contiene la lógica de integración con la API de IGDB.
     */
    private final IGDBService igdbService;

    /**
     * Importa juegos desde la API de IGDB basándose en la consulta proporcionada.
     * 
     * URL: POST /games/import
     * 
     * @param query texto de búsqueda para la API de IGDB (por ejemplo, nombre del juego o palabra clave).
     * @return mensaje indicando el resultado de la importación.
     * 
     */
    @PostMapping("/import")
    public String importGames(@RequestParam String query) {
        return igdbService.fetchAndSaveGames(query);
    }
}