package com.myvideogamelist.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.model.Role;
import com.myvideogamelist.backend.service.RoleService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con los roles de usuario.
 * 
 * Permite consultar los roles disponibles en la aplicación.
 * 
 * Los roles definen los permisos y accesos que tienen los usuarios en el sistema (por ejemplo USER o ADMIN).
 */
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RoleController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de roles.
     */
    private final RoleService roleService;

    /**
     * Devuelve la lista de roles existentes en la base de datos.
     * 
     * URL: GET /api/roles
     * 
     * Este endpoint se puede utilizar, por ejemplo, para mostrar las opciones de rol en una interfaz de administración.
     */
    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }
}
