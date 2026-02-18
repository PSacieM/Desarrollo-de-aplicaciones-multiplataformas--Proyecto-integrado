import React, { useState, useContext } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./LoginPage.css";

function LoginPage() {
  // Estado para el campo nombre de usuario
  const [username, setUsername] = useState("");

  // Estado para el campo contraseña
  const [password, setPassword] = useState("");

  // Estado para mostrar mensaje de error
  const [error, setError] = useState("");

  // Hook para navegación programática
  const navigate = useNavigate();

  // Acceder al método login del contexto de autenticación
  const { login } = useContext(AuthContext);

  // Manejar el envío del formulario de login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto del form (recarga de página)

    try {
      // Hacer la petición POST a la API de login
      const response = await axios.post("/auth/login", { username, password });

      // Extraer los datos de la respuesta
      const { token, userId, username: fetchedUsername, role } = response.data;
      
      // Llamar al método login del AuthContext (almacena token y datos del usuario)
      login(token, userId, fetchedUsername, role);

      // Mostrar notificación de éxito
      toast.success("Inicio de sesión exitoso!", {
        position: "top-right",
      });
      
      // Redirigir a la página de inicio
      navigate("/");
    } catch (err) {
      // En caso de error (usuario/contraseña incorrectos), mostrar mensaje de error
      setError("Usuario o contraseña incorrectos.");

      // Mostrar notificación de error
      toast.error("Usuario o contraseña incorrectos.", {
        position: "top-right",
      });
    }
  };

  // Render del componente
  return (
    <Container className="login-container">
      <h2 className="text-center">Iniciar Sesión</h2>

      {/* Mostrar alerta de error si existe */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Formulario de login */}
      <Form onSubmit={handleLogin} className="mt-3">
        {/* Campo Nombre de Usuario */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre de Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username} // Valor actual del input
            onChange={(e) => setUsername(e.target.value)} // Actualizar estado al escribir
            required // Campo obligatorio
          />
        </Form.Group>

        {/* Campo Contraseña */}
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password} // Valor actual del input
            onChange={(e) => setPassword(e.target.value)} // Actualizar estado al escribir
            required // Campo obligatorio
          />
        </Form.Group>

        {/* Botón de envío */}
        <Button variant="primary" type="submit" className="px-4 mx-auto d-block">
          Iniciar Sesión
        </Button>
      </Form>

      {/* Enlaces para registro y recuperación de contraseña */}
      <p className="mt-3 text-center">
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </p>
      <p className="mt-1 text-center">
        ¿No recuerdas tu contraseña? <a href="/recover-password">Recupérala aquí</a>
      </p>
    </Container>
  );
}

export default LoginPage;