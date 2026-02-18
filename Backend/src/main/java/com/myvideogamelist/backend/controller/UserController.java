package com.myvideogamelist.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myvideogamelist.backend.dto.AdminUserDTO;
import com.myvideogamelist.backend.dto.ChangePasswordRequest;
import com.myvideogamelist.backend.dto.ChangeRoleRequest;
import com.myvideogamelist.backend.dto.UserProfileDTO;
import com.myvideogamelist.backend.mapper.UserMapper;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.service.UserService;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona los endpoints relacionados con los usuarios.
 * 
 * Permite consultar usuarios, gestionar perfiles, cambiar contraseñas, recuperar contraseñas,
 * cambiar roles y eliminar cuentas.
 * 
 * Parte fundamental de la lógica de autenticación y gestión de usuarios en la aplicación.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Permite acceso desde frontend
@RequiredArgsConstructor
public class UserController {

    /**
     * Servicio que contiene la lógica de negocio para la gestión de usuarios.
     */
    private final UserService userService;

    /**
     * Devuelve la lista de todos los usuarios (para gestión de usuarios en el panel de administración).
     * 
     * URL: GET /api/users
     */
    @GetMapping
    public List<AdminUserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Devuelve el perfil del usuario autenticado actual.
     * 
     * URL: GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    /**
     * Devuelve el perfil de un usuario por su ID.
     * 
     * URL: GET /api/users/{id}
     * 
     * Se utiliza para ver el perfil público de otros usuarios.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserById(@PathVariable Long id) {
        UserProfileDTO userProfile = userService.getUserProfileById(id);
        return ResponseEntity.ok(userProfile);
    }

    /**
     * Busca usuarios por nombre de usuario.
     * 
     * URL: GET /api/users/search
     */
    @GetMapping("/search")
    public List<UserProfileDTO> searchUsers(@RequestParam String username) {
        return userService.searchUsers(username);
    }

    /**
     * Crea un nuevo usuario.
     * 
     * URL: POST /api/users
     * 
     * Nota: en la aplicación normal, el registro se hace por /auth/register. Este endpoint se utilizó para pruebas.
     */
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    /**
     * Actualiza el perfil de un usuario.
     * 
     * URL: PUT /api/users/{id}
     * 
     * Permite cambiar el nombre de usuario, email y avatar.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UserProfileDTO updatedUser) {
        User updated = userService.updateUserProfile(id, updatedUser.getUsername(), updatedUser.getEmail(), updatedUser.getAvatarUrl());
        return ResponseEntity.ok(UserMapper.toUserProfileDTO(updated));
    }

    /**
     * Cambia la contraseña de un usuario.
     * 
     * URL: PUT /api/users/{id}/change-password
     */
    @PutMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }

    /**
     * Elimina un usuario.
     * 
     * URL: DELETE /api/users/{id}
     * 
     * El propio usuario puede eliminar su cuenta, o un administrador puede eliminar cualquier usuario.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Recupera la contraseña de un usuario a partir de su email.
     * 
     * URL: PUT /api/users/recover-password
     * 
     * Se genera una nueva contraseña aleatoria que se envía al correo del usuario.
     */
    @PutMapping("/recover-password")
    public ResponseEntity<String> recoverPassword(@RequestParam String email) {
        userService.recoverPassword(email);
        return ResponseEntity.ok("Se ha enviado una nueva contraseña a tu correo.");
    }

    /**
     * Cambia el rol de un usuario.
     * 
     * URL: PUT /api/users/{id}/role
     * 
     * Solo accesible para administradores.
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<String> changeUserRole(@PathVariable Long id,
                                                 @RequestBody ChangeRoleRequest request) {
        userService.changeUserRole(id, request.getRoleName());
        return ResponseEntity.ok("Rol actualizado correctamente");
    }
}
