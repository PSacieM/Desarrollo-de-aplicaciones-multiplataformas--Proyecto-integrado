package com.myvideogamelist.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.myvideogamelist.backend.repository.UserRepository;
import com.myvideogamelist.backend.model.User;

/**
 * Clase utilitaria para obtener el usuario autenticado en la petición actual.
 * 
 * Permite:
 * - obtener el User autenticado (desde la base de datos, actualizado).
 * - lanzar 401 Unauthorized si no hay usuario autenticado.
 * 
 * Facilita el uso de la autenticación en cualquier parte del código (por ejemplo en los servicios).
 */
@Component
public class SecurityUtils {

    private static UserRepository userRepository;

    @Autowired
    public SecurityUtils(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }

    /**
     * Obtiene el usuario autenticado o lanza 401 si no está autenticado.
     * 
     * @return el User autenticado.
     * @throws ResponseStatusException (401) si no hay usuario autenticado.
     */
    public static User getAuthenticatedUserOrThrow401() {
        // Obtener la autenticación actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Comprobar si el usuario no está autenticado
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            System.out.println(">>> Usuario no autenticado");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }

        // Obtener el username del principal
        Object principal = authentication.getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        System.out.println(">>> Usuario autenticado: " + username);

        // Obtener el User actualizado desde la base de datos
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        System.out.println(">>> Usuario autenticado: " + user.getUsername() + " - Rol: " + user.getRole().getName());

        return user;
    }
}
