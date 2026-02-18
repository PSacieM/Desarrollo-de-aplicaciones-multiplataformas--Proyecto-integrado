import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { Container, Form, Button, Alert } from "react-bootstrap";
import "./RecoverPasswordPage.css";

function RecoverPasswordPage() {
  // Estado para el email introducido
  const [email, setEmail] = useState("");

  // Estado para el mensaje de éxito
  const [message, setMessage] = useState("");

  // Estado para el mensaje de error
  const [error, setError] = useState("");

  // Maneja el envío del formulario de recuperación
  const handleRecoverPassword = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      // Llamada PUT a la API para recuperar contraseña
      await axios.put(`/api/users/recover-password?email=${encodeURIComponent(email)}`);
      setMessage("Si el correo es correcto, recibirás un email con tu nueva contraseña."); // Mensaje de éxito
      setError(""); // Limpia el error si lo hubiera
    } catch (err) {
      setError("Error al intentar recuperar la contraseña."); // Muestra error
      setMessage(""); // Limpia el mensaje de éxito si lo hubiera
    }
  };

  return (
    <Container className="recover-password-container mt-5">
      {/* Título */}
      <h2 className="text-center">Recuperar Contraseña</h2>

      {/* Mensaje de éxito */}
      {message && <Alert variant="success">{message}</Alert>}

      {/* Mensaje de error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Formulario */}
      <Form onSubmit={handleRecoverPassword} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email" // Campo de tipo email
            value={email} // Valor del estado email
            onChange={(e) => setEmail(e.target.value)} // Actualiza el email
            required // Campo obligatorio
          />
        </Form.Group>

        {/* Botón de enviar */}
        <Button variant="primary" type="submit" className="w-100">
          Recuperar Contraseña
        </Button>
      </Form>
    </Container>
  );
}

export default RecoverPasswordPage;