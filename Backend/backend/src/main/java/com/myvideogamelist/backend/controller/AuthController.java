package com.myvideogamelist.backend.controller;

import com.myvideogamelist.backend.dto.AuthRequest;
import com.myvideogamelist.backend.dto.AuthResponse;
import com.myvideogamelist.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST que expone los endpoints de autenticación de usuarios.
 * 
 * Los endpoints definidos permiten a los usuarios registrarse e iniciar sesión en la aplicación.
 * 
 * Los métodos delegan la lógica de negocio a la clase AuthService.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * Servicio que contiene la lógica de autenticación (registro e inicio de sesión).
     */
    private final AuthService authService;

    /**
     * Endpoint para registrar un nuevo usuario.
     * 
     * URL: POST /auth/register
     * 
     * @param request objeto AuthRequest con los datos de registro (email, username, password).
     * @return ResponseEntity con el AuthResponse (token JWT y datos del usuario registrado).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        System.out.println(">>> Entrando en AuthService.register()");
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Endpoint para iniciar sesión.
     * 
     * URL: POST /auth/login
     * 
     * @param request objeto AuthRequest con los datos de login (email/username y password).
     * @return ResponseEntity con el AuthResponse (token JWT y datos del usuario autenticado).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}