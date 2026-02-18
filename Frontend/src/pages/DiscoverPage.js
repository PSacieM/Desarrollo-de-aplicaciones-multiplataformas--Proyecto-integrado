import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button, Spinner, Badge, Form } from "react-bootstrap";
import "./DiscoverPage.css";

function DiscoverPage() {
  // Estado de la lista de juegos → se inicializa con lo que haya en localStorage
  const [games, setGames] = useState(() => {
    const savedGames = localStorage.getItem("discoverGames");
    return savedGames ? JSON.parse(savedGames) : [];
  });

  // Estado para controlar si estamos cargando
  const [isLoading, setIsLoading] = useState(false);

  // Estado de la lista de géneros disponibles
  const [genres, setGenres] = useState([]);

  // Estado de la lista de plataformas disponibles
  const [platforms, setPlatforms] = useState([]);

  // Estado de género seleccionado (para el filtro)
  const [selectedGenre, setSelectedGenre] = useState("");

  // Estado de plataforma seleccionada (para el filtro)
  const [selectedPlatform, setSelectedPlatform] = useState("");

  // Hook de navegación
  const navigate = useNavigate();

  // Efecto que se ejecuta al montar el componente
  useEffect(() => {
    fetchGenresAndPlatforms(); // Carga la lista de géneros y plataformas
    if (games.length === 0) {
      fetchRandomGames(); // Si no hay juegos guardados, carga juegos aleatorios
    }
  }, []);

  // Función para obtener géneros y plataformas desde el backend
  const fetchGenresAndPlatforms = async () => {
    try {
      const genresResponse = await axios.get("/api/games/genres");
      const platformsResponse = await axios.get("/api/games/platforms");
      setGenres(genresResponse.data);
      setPlatforms(platformsResponse.data);
    } catch (error) {
      console.error("Error al obtener géneros y plataformas:", error);
    }
  };

  // Función para obtener juegos aleatorios (opcionalmente filtrados)
  const fetchRandomGames = async (genre = "", platform = "") => {
    setIsLoading(true); // Activa el spinner
    try {
      const params = {};
      if (genre) params.genre = genre;
      if (platform) params.platform = platform;

      const response = await axios.get("/api/games/discover", { params });
      setGames(response.data); // Actualiza la lista de juegos
      localStorage.setItem("discoverGames", JSON.stringify(response.data)); // Guarda los resultados en localStorage
    } catch (error) {
      console.error("Error al obtener juegos aleatorios:", error);
    } finally {
      setIsLoading(false); // Desactiva el spinner
    }
  };

  // Maneja el cambio de selección de género
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    fetchRandomGames(e.target.value, selectedPlatform); // Recarga juegos con los filtros actualizados
  };

  // Maneja el cambio de selección de plataforma
  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    fetchRandomGames(selectedGenre, e.target.value); // Recarga juegos con los filtros actualizados
  };

  // Si está cargando → muestra spinner
  if (isLoading) {
    return (
      <div className="loading-spinner d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-4 discover-page">
      <h2 className="text-center mb-4">Descubre Nuevos Juegos</h2>

      {/* Filtros de género y plataforma */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Género</Form.Label>
            <Form.Select value={selectedGenre} onChange={handleGenreChange}>
              <option value="">Todos los Géneros</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plataforma</Form.Label>
            <Form.Select value={selectedPlatform} onChange={handlePlatformChange}>
              <option value="">Todas las Plataformas</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Lista de juegos */}
      <Row className="g-3">
        {games.slice(0, 10).map((game) => (
          <Col md={12} key={game.id} className="d-flex align-items-center position-relative mb-3">
            <Card
              className="flex-grow-1 p-2 shadow-sm"
              onClick={() => navigate(`/games/${game.id}`)} // Al hacer click → navega al detalle del juego
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center">
                <img
                  src={game.coverImage || "https://via.placeholder.com/100x150"} // Imagen de portada (placeholder si no hay)
                  alt={game.title}
                  style={{ width: "80px", height: "120px", objectFit: "cover" }}
                  className="me-3"
                />
                <div className="flex-grow-1">
                  <h5>{game.title}</h5>
                  <p className="mb-0 text-muted">{game.genre} | {game.platform}</p>
                </div>
                {/* Badge de puntuación */}
                <Badge bg="primary" className="ms-auto game-score">⭐ {game.averageScore ? game.averageScore.toFixed(1) : "N/A"}</Badge>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Botón para generar nuevos juegos */}
      <div className="text-center mt-4 mb-4">
        <Button variant="primary" onClick={() => {
          fetchRandomGames(selectedGenre, selectedPlatform); // Vuelve a generar juegos con los filtros actuales
        }}>
          🔄 Generar Nuevos Juegos
        </Button>
      </div>
    </Container>
  );
}

export default DiscoverPage;