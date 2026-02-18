package com.myvideogamelist.backend.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.myvideogamelist.backend.dto.AdminUserDTO;
import com.myvideogamelist.backend.dto.PublicUserDTO;
import com.myvideogamelist.backend.dto.UserProfileDTO;
import com.myvideogamelist.backend.mapper.UserMapper;
import com.myvideogamelist.backend.model.Role;
import com.myvideogamelist.backend.model.User;
import com.myvideogamelist.backend.repository.RoleRepository;
import com.myvideogamelist.backend.repository.UserRepository;
import com.myvideogamelist.backend.security.SecurityUtils;

import lombok.RequiredArgsConstructor;

/**
 * Servicio que gestiona la lógica de negocio relacionada con los usuarios.
 * 
 * Permite:
 * - obtener perfiles de usuario
 * - buscar usuarios
 * - editar perfil propio
 * - cambiar contraseña
 * - eliminar usuarios (por usuario o por admin)
 * - recuperación de contraseña por email
 * - cambiar roles (solo admin)
 * - registrar nuevos usuarios
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RoleRepository roleRepository;

    /**
     * Devuelve todos los usuarios (para administración).
     */
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserMapper::toAdminDTO)
            .collect(Collectors.toList());
    }

    /**
     * Devuelve el perfil del usuario autenticado.
     */
    public UserProfileDTO getCurrentUserProfile() {
        User user = SecurityUtils.getAuthenticatedUserOrThrow401();
        return UserMapper.toUserProfileDTO(user);
    }

    /**
     * Devuelve un usuario por su ID (entidad completa).
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Busca usuarios por nombre de usuario.
     */
    public List<UserProfileDTO> searchUsers(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username).stream()
            .map(UserMapper::toUserProfileDTO)
            .collect(Collectors.toList());
    }

    /**
     * Devuelve un usuario público (id, username, avatar).
     */
    public PublicUserDTO getPublicUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return new PublicUserDTO(user.getId(), user.getUsername(), user.getAvatarUrl());
    }

    /**
     * Devuelve el perfil de un usuario por su ID.
     */
    public UserProfileDTO getUserProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return UserMapper.toUserProfileDTO(user);
    }

    /**
     * Crea un nuevo usuario.
     * - codifica la contraseña
     * - asigna rol USER
     */
    public User createUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPassword()));

        Role userRole = roleRepository.findByName("USER")
            .orElseThrow(() -> new RuntimeException("Rol USER no encontrado"));
        user.setRole(userRole);

        return userRepository.save(user);
    }

    /**
     * Permite a un usuario editar su propio perfil.
     */
    public User updateUserProfile(Long id, String username, String email, String avatarUrl) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();
        User userInDB = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!userInDB.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("No tienes permiso para editar este perfil");
        }

        if (username != null && !username.isEmpty()) {
            userInDB.setUsername(username);
        }

        if (email != null && !email.isEmpty()) {
            userInDB.setEmail(email);
        }

        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            userInDB.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(userInDB);
    }

    /**
     * Permite a un usuario cambiar su propia contraseña.
     */
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("No puedes cambiar la contraseña de otro usuario");
        }

        if (!passwordEncoder.matches(currentPassword, currentUser.getPasswordHash())) {
            throw new AccessDeniedException("La contraseña actual no es correcta");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);
    }

    /**
     * Elimina un usuario.
     * - un usuario puede borrar su propia cuenta
     * - un admin puede borrar cuentas de otros usuarios (con email de notificación)
     */
    public void deleteUser(Long id) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        boolean isSameUser = id.equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().getName().equalsIgnoreCase("admin");

        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!isSameUser && !isAdmin) {
            throw new AccessDeniedException("No tienes permiso para borrar esta cuenta.");
        }

        if (!isSameUser && isAdmin) {
            String to = userToDelete.getEmail();
            String subject = "Tu cuenta ha sido eliminada";
            String body = "Hola " + userToDelete.getUsername() + ",\n\n" +
                          "Un administrador ha eliminado tu cuenta de MyVideogameList.\n" +
                          "Si crees que esto ha sido un error, contacta con el soporte.\n\n" +
                          "Saludos,\nMyVideogameList";

            emailService.sendSimpleEmail(to, subject, body);
        }

        userRepository.deleteById(id);
    }

    /**
     * Recuperación de contraseña.
     * - genera contraseña temporal
     * - la guarda codificada
     * - la envía por email
     */
    public void recoverPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("No existe un usuario con ese correo"));

        String tempPassword = generateRandomPassword(10);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(email, user.getUsername(), tempPassword);
    }

    /**
     * Genera una contraseña aleatoria segura.
     */
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Cambia el rol de un usuario.
     * - solo permitido para administradores
     */
    public void changeUserRole(Long targetUserId, String newRoleName) {
        User currentUser = SecurityUtils.getAuthenticatedUserOrThrow401();

        if (!currentUser.getRole().getName().equalsIgnoreCase("admin")) {
            throw new AccessDeniedException("Solo los administradores pueden cambiar roles.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Usuario objetivo no encontrado"));

        Role newRole = roleRepository.findByName(newRoleName.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + newRoleName));

        targetUser.setRole(newRole);
        userRepository.save(targetUser);
    }

}