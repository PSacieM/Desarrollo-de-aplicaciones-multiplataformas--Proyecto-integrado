// Importa la librería Axios para hacer peticiones HTTP
import axios from "axios";
// Importa la librería toastify para mostrar notificaciones
import { toast } from "react-toastify";

// Crea una instancia personalizada de Axios con la configuración base
const axiosInstance = axios.create({
  // URL base del backend (se puede cambiar según el entorno: desarrollo, producción...)
  baseURL: "http://localhost:8080"
});

// Interceptor de solicitudes (request interceptor)
// Antes de enviar cada solicitud, agrega el token JWT al encabezado Authorization (si existe)
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtiene el token JWT almacenado en el localStorage
    const token = localStorage.getItem("token");

    // Si existe un token, se añade en la cabecera Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Devuelve la configuración actualizada de la solicitud
    return config;
  },
  (error) => {
    // Si ocurre un error en la configuración de la solicitud, se rechaza la promesa
    return Promise.reject(error);
  }
);

// Interceptor de respuestas (response interceptor)
// Maneja errores globales de autenticación (por ejemplo, token expirado o inválido)
axiosInstance.interceptors.response.use(
  (response) => response, // Si la respuesta es correcta, se devuelve tal cual
  (error) => {
    // Si la respuesta tiene un error
    if (error.response) {
      const status = error.response.status;

      // Si el error es 401 (no autorizado), probablemente el token haya expirado o sea inválido
      if (status === 401) {
        console.warn("Token expirado o sesión no válida. Redirigiendo al login.");

        // Muestra notificación de error en la parte superior derecha
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
          position: "top-right",
        });

        // Elimina datos de sesión almacenados en el localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        // Redirige al usuario a la página de login tras un pequeño retraso
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }

    // Propaga el error para que otras partes de la app puedan manejarlo si es necesario
    return Promise.reject(error);
  }
);

// Exporta la instancia personalizada de Axios para ser utilizada en toda la aplicación
export default axiosInstance;
