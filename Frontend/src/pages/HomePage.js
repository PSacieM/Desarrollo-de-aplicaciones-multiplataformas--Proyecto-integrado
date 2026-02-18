import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { Carousel, Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import "./HomePage.css";

function HomePage() {
  // Estado para juegos destacados (featured) en el carrusel
  const [featuredGames, setFeaturedGames] = useState([]);

  // Estado para índice actual del carrusel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estado para juegos más populares (top-rated)
  const [popularGames, setPopularGames] = useState([]);

  // Estado para últimos comentarios
  const [latestComments, setLatestComments] = useState([]);

  // Estado para mostrar u ocultar el modal de "Añadir juego"
  const [showModal, setShowModal] = useState(false);

  // Estado del formulario de nuevo juego
  const [newGame, setNewGame] = useState({
    title: "",         // Título del juego
    description: "",   // Descripción
    releaseDate: "",   // Fecha de lanzamiento
    genre: "",         // Género
    platform: "",      // Plataforma
    coverImage: ""     // URL de la imagen de portada
  });

  // Estado para saber si el usuario es administrador
  const [isAdmin, setIsAdmin] = useState(false);

  // Estado para controlar qué comentarios están expandidos
  const [expandedComments, setExpandedComments] = useState({});

  // Hook para navegación programática
  const navigate = useNavigate();

  // useEffect que se ejecuta al montar el componente
  useEffect(() => {
    // Función para comprobar si el usuario es administrador
    const checkAdminRole = () => {
      const userRole = localStorage.getItem("role");
      setIsAdmin(userRole?.toUpperCase() === "ADMIN");
    };

    // Ejecutar las funciones de carga en paralelo
    Promise.all([
      fetchFeaturedGames(),
      fetchPopularGames(),
      fetchLatestComments()
    ]).then(() => {
      checkAdminRole(); // Una vez cargados los datos, comprobar rol
    });
  }, []);

  /* Funciones de obtención de datos */

  // Obtener juegos destacados (random) para el carrusel
  const fetchFeaturedGames = async () => {
    try {
      const response = await axios.get("/api/games/random");
      setFeaturedGames(response.data);
    } catch (error) {
      console.error("Error al obtener juegos aleatorios:", error);
    }
  };

  // Obtener los juegos más populares (top-rated)
  const fetchPopularGames = async () => {
    const response = await axios.get("/api/scores/top-rated");
    setPopularGames(response.data.slice(0, 3)); // Solo los 3 primeros
  };

  // Obtener los últimos comentarios
  const fetchLatestComments = async () => {
    try {
      const response = await axios.get("/api/comments/latest");
      setLatestComments(response.data);
    } catch (error) {
      console.error("Error al obtener los últimos comentarios:", error);
    }
  };

  /* Funciones para el modal de nuevo juego */

  // Mostrar el modal
  const handleShowModal = () => setShowModal(true);

  // Ocultar el modal
  const handleCloseModal = () => setShowModal(false);

  // Actualizar estado del formulario de nuevo juego
  const handleNewGameChange = (e) => {
    const { name, value } = e.target;
    setNewGame((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar nuevo juego (POST a la API)
  const handleSaveGame = async () => {
    await axios.post("/api/games", newGame); // Enviar nuevo juego
    setShowModal(false); // Cerrar el modal
    fetchFeaturedGames(); // Recargar juegos destacados
  };

  /* Funciones de navegación del carrusel */

  // Avanzar al siguiente juego en el carrusel
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredGames.length);
  };

  // Retroceder al juego anterior en el carrusel
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredGames.length - 1 : prevIndex - 1
    );
  };

  /* Función para expandir/colapsar un comentario */
  const toggleExpand = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Cambiar el estado de expansión
    }));
  };

  return (
    <>
      {/* Botones de administración (solo visibles si es admin) */}
      {isAdmin && (
        <div className="admin-buttons d-flex flex-column flex-md-row position-relative mb-3">
          <Button
            variant="primary"
            onClick={handleShowModal} // Mostrar modal para añadir juego
            className="me-2 mb-2 mb-md-0"
          >
            Añadir Juego
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/users")} // Ir a gestión de usuarios
            className="mb-2 mb-md-0"
          >
            Gestionar Usuarios
          </Button>
        </div>
      )}

      <div className="container mt-4 home-page">

        {/* Carrusel de juegos destacados */}
        <h2 className="mb-4 text-center">Juegos Destacados</h2>
        <Row className="justify-content-center">
          <Col xs={12} md={12} className="position-relative">

            {/* Carrusel 3D (solo visible en pantallas medianas y grandes) */}
            <div className="custom-carousel-3d d-none d-md-flex position-relative mx-auto">
              {featuredGames.map((game, index) => {
                const isActive = index === currentIndex;
                const isPrev = index === (currentIndex === 0 ? featuredGames.length - 1 : currentIndex - 1);
                const isNext = index === (currentIndex + 1) % featuredGames.length;

                return (
                  <div
                    key={game.id}
                    className={`carousel-3d-item ${isActive ? "active" : ""} ${isPrev ? "prev" : ""} ${isNext ? "next" : ""}`}
                  >
                    <Link to={`/games/${game.id}`} className="text-decoration-none">
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="rounded"
                        style={{ width: "250px", height: "350px", objectFit: "cover" }}
                      />
                    </Link>
                  </div>
                );
              })}

              {/* Botones de navegación del carrusel */}
              <button className="carousel-3d-button left" onClick={handlePrev}>
                &#10094;
              </button>
              <button className="carousel-3d-button right" onClick={handleNext}>
                &#10095;
              </button>
            </div>

            {/* Carrusel normal de Bootstrap para pantallas pequeñas */}
            <Carousel className="d-md-none">
              {featuredGames.map((game) => (
                <Carousel.Item key={game.id}>
                  <Link to={`/games/${game.id}`}>
                    <img
                      className="d-block w-100"
                      src={game.coverImage}
                      alt={game.title}
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                  </Link>
                  <Carousel.Caption>
                    <h3>{game.title}</h3>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>

        {/* Fila con dos columnas: Juegos Populares y Últimos Comentarios */}
        <Row className="equal-height">

          {/* Columna: Juegos Populares */}
          <Col md={6}>
            <h3>Juegos Populares</h3>
            <div className="section-container popular-games">
              {popularGames.length > 0 ? (
                popularGames.map((game, index) => (
                  <Link to={`/games/${game.gameId}`} key={`popular-${game.gameId || index}`} className="text-decoration-none">
                    <Card className="mb-3 shadow-sm d-flex flex-row align-items-center" style={{ width: "100%", height: "auto", cursor: "pointer" }}>
                      <div className="d-flex align-items-center" style={{ width: "100%" }}>
                        <Card.Img
                          src={game.coverImage || "https://via.placeholder.com/150"}
                          alt={game.gameTitle || "Juego sin título"}
                          style={{ width: "100px", height: "auto", objectFit: "cover" }}
                          className="rounded-start"
                        />
                        <Card.Body className="d-flex flex-column justify-content-center p-3">
                          <Card.Title style={{ fontSize: "18px", marginBottom: "4px" }}>
                            {game.gameTitle ? game.gameTitle : "Juego sin título"}
                          </Card.Title>
                          <Card.Text style={{ fontSize: "14px", color: "#6c757d" }}>
                            Puntuación Media: {game.averageScore ? game.averageScore.toFixed(1) : "Sin puntuación"}
                          </Card.Text>
                        </Card.Body>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <p>No hay juegos populares disponibles.</p>
              )}
            </div>
          </Col>

          {/* Columna: Últimos Comentarios */}
          <Col md={6}>
            <h3>Últimos Comentarios</h3>
            <div className="section-container latest-comments">
              {latestComments.map((comment) => (
                <Card className="mb-3 shadow-sm comment-card" key={`comment-${comment.id}`}>
                  <Card.Body className="d-flex align-items-start">
                    <div className="me-3 flex-shrink-0">
                      <img
                        src={comment.avatarUrl || "/default-avatar.png"}
                        alt={comment.username || "Avatar"}
                        className="rounded-circle"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    </div>

                    <div className="comment-content flex-grow-1">
                      {/* Texto del comentario (truncado/expandido) */}
                      <p
                        className={`mb-1 comment-text ${!expandedComments[comment.id] ? "truncate-3-lines" : ""}`}
                        style={
                          expandedComments[comment.id]
                            ? { WebkitLineClamp: "unset", display: "block" }
                            : {}
                        }
                      >
                        {comment.commentText.length > 80 && !expandedComments[comment.id]
                          ? `${comment.commentText.slice(0, 80)}...`
                          : comment.commentText}
                        {comment.commentText.length > 80 && (
                          <button
                            className="btn btn-link btn-sm ps-1"
                            style={{ textDecoration: "underline", color: "#3F51B5" }}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleExpand(comment.id);
                            }}
                          >
                            {expandedComments[comment.id] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </p>

                      {/* Pie de comentario (usuario y juego) */}
                      <small className="text-muted">
                        -{" "}
                        {comment.userId ? (
                          <Link to={`/profile/${comment.userId}`} className="username-link">
                            {comment.username || "Usuario desconocido"}
                          </Link>
                        ) : (
                          <span className="username-link">{comment.username || "Usuario desconocido"}</span>
                        )}
                        {" "}en{" "}
                        <Link to={comment.gameId ? `/games/${comment.gameId}` : "#"} className="game-link">
                          {comment.gameTitle || "Juego desconocido"}
                        </Link>
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>
        </Row>
      </div>

      {/* Modal para añadir un nuevo juego */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Añadir Juego</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" name="title" onChange={handleNewGameChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control type="text" name="description" onChange={handleNewGameChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha de Lanzamiento</Form.Label>
              <Form.Control type="date" name="releaseDate" onChange={handleNewGameChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Género</Form.Label>
              <Form.Control type="text" name="genre" onChange={handleNewGameChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Plataforma</Form.Label>
              <Form.Control type="text" name="platform" onChange={handleNewGameChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>URL de Imagen</Form.Label>
              <Form.Control type="text" name="coverImage" onChange={handleNewGameChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveGame}>Guardar Juego</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default HomePage;