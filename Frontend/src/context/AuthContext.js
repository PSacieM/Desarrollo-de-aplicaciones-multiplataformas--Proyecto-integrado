import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import { toast } from "react-toastify";

// Crea el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto (AuthProvider)
// Este componente rodea a la app y proporciona el contexto a los hijos
export const AuthProvider = ({ children }) => {
  // Estado local del usuario autenticado
  const [user, setUser] = useState(null);

  // Hook de navegación
  const navigate = useNavigate();

  // Efecto que se ejecuta al montar el componente
  // Carga el usuario desde localStorage si ya estaba autenticado previamente
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    // Si hay token y userId, se restaura la sesión en el estado local
    if (token && userId) {
      setUser({ token, userId, username, role });
    }
  }, []);

  // Efecto para verificar autenticación automáticamente
  // Añade un interceptor global a Axios que detecta errores 401 (token expirado o inválido)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Si la respuesta es correcta, se devuelve tal cual
      (error) => {
        // Si la respuesta es un error 401 (no autorizado)
        if (error.response && error.response.status === 401) {
          // Muestra un mensaje y fuerza logout automático
          toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          logout();
        }
        return Promise.reject(error); // Propaga el error
      }
    );

    // Limpia el interceptor cuando el componente se desmonta
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Función para iniciar sesión
  const login = (token, userId, username, role) => {
    // Guarda los datos en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);

    // Actualiza el estado local del usuario
    setUser({ token, userId, username, role });

    // Redirige al inicio
    navigate("/");
  };

  // Función para cerrar sesión
  const logout = () => {
    // Elimina los datos del usuario en localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Limpia el estado local del usuario
    setUser(null);

    // Redirige al login
    navigate("/login");

    // Muestra un mensaje de confirmación
    toast.info("Has cerrado sesión correctamente.");
  };

  // Retorna el proveedor del contexto
  // value = objeto que pueden consumir los componentes que usen AuthContext
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children} {/* Renderiza los hijos dentro del contexto */}
    </AuthContext.Provider>
  );
};