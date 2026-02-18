package com.myvideogamelist.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myvideogamelist.backend.model.User;

/**
 * Repositorio JPA para la entidad User.
 * 
 * Gestiona el acceso a los datos de los usuarios.
 * 
 * Permite buscar usuarios por username, email, y realizar búsquedas parciales de usernames.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Devuelve un usuario por su username (nombre de usuario).
     * 
     * Se utiliza en el proceso de autenticación.
     * 
     * @param username nombre de usuario.
     * @return Optional<User> que contiene el usuario si existe.
     */
    Optional<User> findByUsername(String username);

    /**
     * Devuelve una lista de usuarios cuyo username contenga el texto de búsqueda (ignorando mayúsculas/minúsculas).
     * 
     * Se utiliza en el endpoint de búsqueda de usuarios.
     * 
     * @param username texto de búsqueda parcial.
     * @return lista de usuarios cuyo username coincida parcialmente.
     */
    List<User> findByUsernameContainingIgnoreCase(String username);

    /**
     * Devuelve un usuario por su email.
     * 
     * Se utiliza en el proceso de recuperación de contraseña.
     * 
     * @param email email del usuario.
     * @return Optional<User> que contiene el usuario si existe.
     */
    Optional<User> findByEmail(String email);
}
