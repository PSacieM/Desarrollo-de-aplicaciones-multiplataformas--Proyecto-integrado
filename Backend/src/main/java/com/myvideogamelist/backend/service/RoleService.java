package com.myvideogamelist.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.model.Role;
import com.myvideogamelist.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona los roles de usuario en la plataforma.
 * 
 * Permite obtener la lista de roles disponibles.
 * 
 * Los roles se usan para controlar el acceso a funcionalidades según permisos:
 * - USER: usuario normal
 * - ADMIN: administrador
 */
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * Devuelve todos los roles existentes en la base de datos.
     * 
     * @return lista de roles
     */
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

}
