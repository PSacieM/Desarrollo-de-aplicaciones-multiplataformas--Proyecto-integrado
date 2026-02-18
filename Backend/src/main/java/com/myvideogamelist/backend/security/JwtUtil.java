package com.myvideogamelist.backend.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.myvideogamelist.backend.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Clase utilitaria para gestionar tokens JWT.
 * 
 * Permite:
 * - Generar tokens JWT (cuando el usuario inicia sesión).
 * - Validar tokens JWT.
 * - Extraer información del token (por ejemplo el username).
 * 
 * Los tokens son firmados con una clave secreta y tienen una duración limitada (10 horas).
 * 
 * Esta clase es utilizada por el filtro JwtAuthFilter y por el servicio de autenticación.
 */
@Component
public class JwtUtil {

    // Clave secreta para firmar los tokens JWT (debería estar en una variable de entorno en producción)
    private static final String SECRET_KEY = "zJNFV2hvzLuXZTpnX4zQwv6Qf8gUQO9+gj3Npz2p7Vk=";

    /**
     * Genera un token JWT para un usuario.
     * 
     * El token contiene:
     * - el username como subject.
     * - la fecha de emisión.
     * - la fecha de expiración (10 horas desde la emisión).
     * 
     * @param user el usuario para el que se genera el token.
     * @return el token JWT como String.
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 horas
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae el username contenido en un token JWT.
     * 
     * @param token el token JWT.
     * @return el username (subject) contenido en el token.
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Valida un token JWT.
     * 
     * Comprueba que:
     * - el username del token corresponde al usuario indicado.
     * - el token no ha expirado.
     * 
     * @param token el token JWT.
     * @param user el usuario que se está validando.
     * @return true si el token es válido, false en caso contrario.
     */
    public boolean isTokenValid(String token, User user) {
        final String username = extractUsername(token);
        return username.equals(user.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Comprueba si un token JWT ha expirado.
     * 
     * @param token el token JWT.
     * @return true si el token ha expirado, false en caso contrario.
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extrae todos los claims contenidos en un token JWT.
     * 
     * @param token el token JWT.
     * @return el objeto Claims con todos los datos del token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Devuelve la clave utilizada para firmar y validar tokens JWT.
     * 
     * @return el objeto Key con la clave de firma.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

