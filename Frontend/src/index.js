import React from 'react';
import ReactDOM from 'react-dom/client';

// Importación de estilos globales
import './index.css';
// Importación de estilos de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
// Importación de estilos de Leaflet (mapas)
import 'leaflet/dist/leaflet.css';

// Importación del componente principal de la aplicación
import App from './App';
// Importación del enrutador de React Router
import { BrowserRouter as Router } from 'react-router-dom';

// Creación del root de React (React 18)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizado de la aplicación dentro del enrutador
root.render(
  <Router>
    {/* Importación de la fuente personalizada */}
    <link rel="stylesheet" href="/fonts/fonts.css" />
    
    {/* Componente principal de la aplicación */}
    <App />
  </Router>
);