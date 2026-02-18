package com.myvideogamelist.backend.security;

import com.myvideogamelist.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Servicio personalizado que implementa UserDetailsService.
 * 
 * Es utilizado por Spring Security para cargar los datos del usuario durante el proceso de autenticación.
 * 
 * Cuando un usuario intenta iniciar sesión, Spring Security llama automáticamente a este servicio
 * para obtener la información del usuario (username, contraseña, roles, etc.).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /**
     * Repositorio de usuarios.
     * Se utiliza para buscar usuarios en la base de datos.
     */
    private final UserRepository userRepository;

    /**
     * Carga un usuario por su username.
     * 
     * Este método es llamado automáticamente por Spring Security durante el proceso de autenticación.
     * 
     * @param username nombre de usuario introducido por el usuario.
     * @return UserDetails con la información del usuario.
     * @throws UsernameNotFoundException si no se encuentra un usuario con ese username.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }
}