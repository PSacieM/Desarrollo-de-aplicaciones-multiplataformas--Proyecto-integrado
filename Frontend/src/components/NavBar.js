import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Form, FormControl, NavDropdown } from "react-bootstrap";
import { FaUser, FaSignInAlt, FaSearch, FaUsers, FaGamepad, FaBars } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./NavBar.css";

function NavBar() {
  // Extrae el usuario actual y la función logout del contexto de autenticación
  const { user, logout } = useContext(AuthContext);

  // Estado local para la consulta de búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Estado local para detectar si estamos en modo móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Hook de navegación de React Router
  const navigate = useNavigate();

  // Hook useEffect para escuchar cambios en el tamaño de la ventana (responsive)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Si el ancho es < 768px, estamos en móvil
    };

    // Añade listener
    window.addEventListener("resize", handleResize);

    // Limpia el listener cuando el componente se desmonta
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función para manejar el envío del formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    if (searchQuery.trim() !== "") {
      // Navega a la página de resultados de búsqueda, pasando la consulta como parámetro de URL
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}&type=games`);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3 shadow-sm">
      <Container className="d-flex align-items-center justify-content-between">

        {/* Logo + Marca */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src={logo} alt="Logo" className="navbar-logo" />
          MyVideogameList
        </Navbar.Brand>

        {/* Menú Hamburguesa */}
        <div className="menu-mobile ms-2">
          <NavDropdown
            title={<FaBars size={28} />} // Icono del menú hamburguesa
            id="explore-dropdown"
            className={`d-flex align-items-center ${isMobile ? "dropstart" : ""}`} // Si es móvil, menú se abre hacia la izquierda
          >
            {/* Enlaces del menú */}
            <NavDropdown.Item as={Link} to="/top-100">Top 100 Mejores Juegos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/upcoming">Próximos Lanzamientos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/discover">Descubrir</NavDropdown.Item>
            <NavDropdown.Divider /> {/* Separador visual */}
            <NavDropdown.Item as={Link} to="/stores">Tiendas Cercanas</NavDropdown.Item>
          </NavDropdown>
        </div>

        {/* Barra de Búsqueda */}
        <div className="search-bar-wrapper">
          <Form
            className="d-flex search-bar-centered"
            onSubmit={handleSearch} // Ejecuta la búsqueda al enviar el formulario
            style={{ flexGrow: 1, maxWidth: "500px" }}
          >
            <FormControl
              type="search"
              placeholder="Buscar juegos..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Actualiza el estado con el texto introducido
            />
            <FaSearch
              style={{ cursor: "pointer" }}
              onClick={handleSearch} // Permite lanzar la búsqueda clicando en el icono
            />
          </Form>
        </div>

        {/* Enlaces de Usuario */}
        <Nav className="ms-auto align-items-center">
          {/* Si el usuario está logueado */}
          {user ? (
            <>
              {/* Si el usuario es ADMIN, muestra enlace de gestión de usuarios */}
              {user.role === "ADMIN" && (
                <Link to="/admin/users" className="text-dark me-3">
                  <FaUsers size={24} /> Gestionar usuarios
                </Link>
              )}

              {/* Acciones de usuario (perfil y cerrar sesión) */}
              <div className="user-actions-responsive d-flex flex-wrap flex-md-nowrap justify-content-center gap-2">
                <Link to={`/profile/${user.userId}`} className="text-dark nav-icon-text">
                  <FaUser size={24} /> Perfil
                </Link>
                <span
                  className="text-danger nav-icon-text"
                  onClick={logout} // Llama a logout al hacer clic
                  style={{ cursor: "pointer" }}
                >
                  <FaSignInAlt size={24} /> Cerrar sesión
                </span>
              </div>
            </>
          ) : (
            // Si el usuario NO está logueado, muestra botones de login y registro
            <div className="user-actions-responsive d-flex flex-wrap flex-md-nowrap justify-content-center gap-2">
              <Link to="/login" className="text-dark nav-icon-text">
                <FaSignInAlt size={24} /> Conectarse
              </Link>
              <Link to="/register" className="text-dark nav-icon-text">
                <FaUser size={24} /> Registrarse
              </Link>
            </div>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;