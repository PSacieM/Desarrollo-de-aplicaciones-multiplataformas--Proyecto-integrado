package com.myvideogamelist.backend.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.UserRepository;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro de autenticación JWT.
 * 
 * Este filtro se ejecuta en cada petición HTTP (OncePerRequestFilter).
 * 
 * Su función es:
 * - Leer el token JWT de la cabecera Authorization.
 * - Validar el token.
 * - Si es válido, autenticar al usuario y establecerlo en el contexto de seguridad (SecurityContextHolder).
 * 
 * De esta forma, la aplicación es stateless: no se mantienen sesiones en servidor, todo se gestiona con JWT.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Lista de rutas públicas (actualmente no se está usando activamente en el filtro)
    private static final List<String> PUBLIC_PATHS = List.of(
        "/auth",
        "/api/games",
        "/api/scores/game",
        "/api/scores/top-rated",
        "/api/lists/user",
        "/api/games-in-lists/list/",
        "/api/games-in-lists/exists",
        "/api/comments/game",
        "/api/comments/user",
        "/api/users/search",
        "/api/users/",
        "/api/translate"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();
        System.out.println(">>> PATH: " + path + " [" + method + "]");

        // Permitir las solicitudes OPTIONS sin autenticación
        if (method.equalsIgnoreCase("OPTIONS")) {
            System.out.println(">>> Solicitud OPTIONS detectada, permitiendo acceso sin autenticación");
            response.setStatus(HttpServletResponse.SC_OK);
            filterChain.doFilter(request, response);
            return;
        }

        // Leer la cabecera Authorization
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(">>> No se proporcionó token Bearer");
            filterChain.doFilter(request, response);
            return;
        }

        // Extraer el token JWT
        final String jwt = authHeader.substring(7);
        String username = null;

        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (ExpiredJwtException ex) {
            System.out.println(">>> Error: El token JWT ha expirado.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("El token JWT ha expirado. Por favor, inicia sesión nuevamente.");
            return;
        } catch (Exception ex) {
            System.out.println(">>> Error: Token JWT inválido. Detalles: " + ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token JWT inválido. Por favor, inicia sesión nuevamente.");
            return;
        }

        // Si el usuario no está autenticado todavía en esta petición
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByUsername(username).orElse(null);

            if (user != null && jwtUtil.isTokenValid(jwt, user)) {
                // Autenticar al usuario y establecerlo en el contexto de seguridad
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println(">>> Usuario autenticado: " + username);
            } else {
                System.out.println(">>> Token inválido o usuario no encontrado");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token JWT inválido. Por favor, inicia sesión nuevamente.");
                return;
            }
        }

        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
