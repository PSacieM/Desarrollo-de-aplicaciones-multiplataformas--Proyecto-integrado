// Página de registro
import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import "./RegisterPage.css";

function RegisterPage() {

  /* Estados del formulario */
  const [username, setUsername] = useState(""); // Nombre de usuario
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmación de contraseña
  const [error, setError] = useState(""); // Mensaje de error

  /* Hook para navegar entre páginas */
  const navigate = useNavigate();

  /* Manejar el envío del formulario de registro */
  const handleRegister = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validación: comprobar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Llamada POST al endpoint de registro
      await axios.post("/auth/register", { username, email, password });

      // Redirige a la página de login tras registro exitoso
      navigate("/login");
    } catch (err) {
      // Muestra un error si falla el registro
      setError("Error al registrarse. Inténtalo de nuevo.");
    }
  };

  /* Render del componente */
  return (
    <Container className="register-container">

      {/* Título */}
      <h2 className="text-center">Registrarse</h2>

      {/* Mensaje de error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Formulario de registro */}
      <Form onSubmit={handleRegister} className="mt-3">

        {/* Campo Nombre de Usuario */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre de Usuario</Form.Label>
          <Form.Control 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </Form.Group>

        {/* Campo Correo Electrónico */}
        <Form.Group className="mb-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </Form.Group>

        {/* Campo Contraseña */}
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Form.Group>

        {/* Campo Confirmar Contraseña */}
        <Form.Group className="mb-3">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </Form.Group>

        {/* Botón de enviar */}
        <Button variant="primary" type="submit" className="px-4 mx-auto d-block">
          Registrarse
        </Button>

      </Form>

      {/* Enlace a la página de login */}
      <p className="mt-3 text-center">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
      </p>

    </Container>
  );

}

export default RegisterPage;