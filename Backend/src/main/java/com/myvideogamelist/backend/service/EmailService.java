package com.myvideogamelist.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Servicio que gestiona el envío de emails.
 * 
 * Permite enviar:
 * - emails de recuperación de contraseña
 * - emails informativos (por ejemplo, aviso de eliminación de comentario)
 * 
 * Utiliza JavaMailSender para enviar los correos.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Envía un email de recuperación de contraseña con una contraseña temporal.
     * 
     * @param toEmail destinatario.
     * @param username nombre de usuario.
     * @param tempPassword contraseña temporal generada.
     */
    public void sendPasswordResetEmail(String toEmail, String username, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Recuperación de contraseña - MyVideogameList");
        message.setText("Hola " + username + ",\n\n" +
                "Tu nueva contraseña temporal es: " + tempPassword + "\n\n" +
                "Por favor, inicia sesión y cámbiala desde tu perfil.");

        mailSender.send(message);
    }

    /**
     * Envía un email simple con el asunto y cuerpo indicados.
     * 
     * @param toEmail destinatario.
     * @param subject asunto del email.
     * @param body cuerpo del email.
     */
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
