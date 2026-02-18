// Importación de estilos globales
import './App.css';

// Importaciones de React y React Router
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Importación de páginas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import GameDetailsPage from "./pages/GameDetailsPage";
import SearchPage from "./pages/SearchPage";
import Top100Page from "./pages/Top100Page";
import UpcomingGamesPage from "./pages/UpcomingGamesPage";
import DiscoverPage from "./pages/DiscoverPage";
import UserManagementPage from "./pages/UserManagementPage";
import RecoverPasswordPage from "./pages/RecoverPasswordPage";
import UserCommentsPage from './pages/UserCommentsPage';
import UserRatingsPage from './pages/UserRatingsPage';
import UserListsPage from './pages/UserListsPage';
import StoresMapPage from './pages/StoresMapPage';

// Importación de componentes
import NavBar from "./components/NavBar";
import ProtectedRoutes from "./components/ProtectedRoutes";

// Contexto de autenticación
import { AuthProvider } from "./context/AuthContext";

// Notificaciones
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    // Contexto global de autenticación
    <AuthProvider>
      
      {/* Barra de navegación visible en toda la aplicación */}
      <NavBar />

      {/* Contenedor principal de las rutas */}
      <div className="container mt-4">

        {/* Definición de rutas de la aplicación */}
        <Routes>

          {/* Página de inicio */}
          <Route path="/" element={<HomePage />} />

          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recover-password" element={<RecoverPasswordPage />} />

          {/* Perfil de usuario */}
          <Route path="/profile/:id" element={<ProfilePage />} />

          {/* Páginas relacionadas con videojuegos */}
          <Route path="/games/:id" element={<GameDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/top-100" element={<Top100Page />} />
          <Route path="/upcoming" element={<UpcomingGamesPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/stores" element={<StoresMapPage />} />

          {/* Páginas de comentarios y puntuaciones del usuario */}
          <Route path="/user/:userId/comments" element={<UserCommentsPage />} />
          <Route path="/user/:userId/ratings" element={<UserRatingsPage />} />
          <Route path="/user/:userId/lists" element={<UserListsPage />} />

          {/* Ruta protegida: solo accesible por ADMIN */}
          <Route element={<ProtectedRoutes adminOnly={true} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>

          {/* Ruta wildcard (cualquier ruta no encontrada redirige a Home) */}
          <Route path="*" element={<Navigate to="/" />} />
        
        </Routes>

        {/* Contenedor para mostrar notificaciones (Toast) */}
        <ToastContainer />

      </div>
    </AuthProvider>
  );
}

export default App;