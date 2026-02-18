import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Componente para proteger rutas (solo accesibles para usuarios autenticados)
// Si la prop adminOnly es true, también verifica que el usuario sea administrador
function ProtectedRoutes({ adminOnly = false }) {
  // Obtiene el token JWT del localStorage (si existe)
  const token = localStorage.getItem("token");

  // Obtiene el rol del usuario del localStorage (si existe)
  const role = localStorage.getItem("role");

  // Si no hay token → el usuario no está autenticado
  if (!token) {
    // Redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si la ruta es solo para admins y el rol no es ADMIN
  if (adminOnly && role?.toUpperCase() !== "ADMIN") {
    // Redirige a la página de inicio
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado y tiene permiso para acceder
  // Renderiza las rutas hijas (<Outlet /> es un placeholder para las rutas anidadas)
  return <Outlet />;
}

export default ProtectedRoutes;