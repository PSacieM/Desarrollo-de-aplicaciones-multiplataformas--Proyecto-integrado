package com.myvideogamelist.backend.controller;

import com.myvideogamelist.backend.dto.TranslateRequestDTO;
import com.myvideogamelist.backend.dto.TranslateResponseDTO;
import com.myvideogamelist.backend.service.TranslationService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST que gestiona la traducción de textos al español.
 * 
 * Este endpoint permite enviar un texto en inglés y recibir su traducción al español.
 * 
 * Se utiliza principalmente para traducir la descripción de los juegos en la página de detalles.
 */
@RestController
@RequestMapping("/api/translate")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TranslationController {

    /**
     * Servicio que contiene la lógica de integración con la API de traducción externa.
     */
    private final TranslationService translationService;

    /**
     * Traduce un texto al español.
     * 
     * URL: POST /api/translate
     * 
     * @param request objeto que contiene el texto a traducir.
     * @return objeto que contiene el texto traducido.
     * 
     * Nota: este endpoint se utiliza desde el frontend cuando el usuario pulsa "Traducir descripción" en la ficha de un juego.
     */
    @PostMapping
    public TranslateResponseDTO translateToSpanish(@RequestBody TranslateRequestDTO request) {
        System.out.println(">>> TRADUCCIÓN RECIBIDA: " + request.getText());
        return translationService.translateToSpanish(request.getText());
    }
}