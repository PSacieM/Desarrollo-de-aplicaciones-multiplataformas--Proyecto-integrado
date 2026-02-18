package com.myvideogamelist.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myvideogamelist.backend.model.Role;

/**
 * Repositorio JPA para la entidad Role.
 * 
 * Gestiona el acceso a los datos de los roles de usuario.
 * 
 * Los roles definen los permisos que tienen los usuarios en la plataforma (por ejemplo USER o ADMIN).
 */
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Devuelve un rol por su nombre.
     * 
     * Se utiliza al registrar nuevos usuarios (para asignarles el rol USER),
     * y en la gestión de usuarios (para cambiar su rol).
     * 
     * @param name nombre del rol (por ejemplo "USER" o "ADMIN").
     * @return Optional<Role> que contiene el rol si existe.
     */
    Optional<Role> findByName(String name);
}
