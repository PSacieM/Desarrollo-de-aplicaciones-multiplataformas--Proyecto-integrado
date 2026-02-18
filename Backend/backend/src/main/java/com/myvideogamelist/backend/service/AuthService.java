package com.myvideogamelist.backend.service;

import com.myvideogamelist.backend.dto.AuthRequest;
import com.myvideogamelist.backend.dto.AuthResponse;
import com.myvideogamelist.backend.model.Role;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.RoleRepository;
import com.myvideogamelist.backend.repository.UserRepository;
import com.myvideogamelist.backend.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servicio que gestiona la autenticación de usuarios.
 * 
 * Permite:
 * - registrar nuevos usuarios (register)
 * - autenticar usuarios existentes (login)
 * 
 * Utiliza JWT para generar tokens de autenticación.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final GameListService gameListService;

    /**
     * Registra un nuevo usuario.
     * 
     * - Asigna el rol "user".
     * - Cifra la contraseña con BCrypt.
     * - Crea listas por defecto para el usuario.
     * - Devuelve un token JWT para que el usuario quede autenticado tras el registro.
     * 
     * @param request datos del usuario a registrar.
     * @return AuthResponse con token JWT y datos del usuario.
     */
    public AuthResponse register(AuthRequest request) {
        Role userRole = roleRepository.findByName("user")
                .orElseThrow(() -> new RuntimeException("Role 'user' not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);

        userRepository.save(user);

        // Crear listas por defecto (Jugados, Jugando, Pendientes)
        gameListService.createDefaultListsForUser(user);

        // Generar token JWT
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole().getName());
    }

    /**
     * Autentica un usuario existente.
     * 
     * - Valida username y password con Spring Security.
     * - Devuelve un token JWT si la autenticación es correcta.
     * 
     * @param request datos de autenticación.
     * @return AuthResponse con token JWT y datos del usuario.
     */
    public AuthResponse login(AuthRequest request) {
        // Autenticación con Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Obtener el usuario desde la base de datos
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generar token JWT
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole().getName());
    }
}
