import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { Link } from "react-router-dom";
import { Card, Container, Row, Col, Spinner, Pagination, Form } from "react-bootstrap";
import "./UpcomingGamesPage.css";

function UpcomingGamesPage() {
  // Estados para datos y filtros
  const [upcomingGames, setUpcomingGames] = useState([]); // Lista de juegos próximos
  const [isLoading, setIsLoading] = useState(true); // Indicador de carga
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [sortOrder, setSortOrder] = useState("asc"); // Orden ascendente o descendente
  const [genreFilter, setGenreFilter] = useState(""); // Filtro por género
  const [platformFilter, setPlatformFilter] = useState(""); // Filtro por plataforma
  const [genres, setGenres] = useState([]); // Lista de géneros disponibles
  const [platforms, setPlatforms] = useState([]); // Lista de plataformas disponibles
  const ITEMS_PER_PAGE = 10; // Juegos por página

  // Carga inicial de juegos y filtros
  useEffect(() => {
    fetchUpcomingGames();
    fetchGenresAndPlatforms();
  }, []);

  // Carga cuando se cambia un filtro
  useEffect(() => {
    fetchUpcomingGames();
  }, [genreFilter, platformFilter, sortOrder]);

  // Obtener próximos lanzamientos desde la API
  const fetchUpcomingGames = async () => {
    setIsLoading(true);
    try {
      const params = {
        sortOrder,
        genre: genreFilter || undefined,
        platform: platformFilter || undefined
      };

      const response = await axios.get("/api/games/upcoming", { params });
      setUpcomingGames(response.data);
    } catch (error) {
      console.error("Error al obtener los próximos lanzamientos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener géneros y plataformas desde la API
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

  // Cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Aplicar filtros y orden
  const filteredAndSortedGames = upcomingGames
    .filter(game =>
      (!genreFilter || game.genre.includes(genreFilter)) &&
      (!platformFilter || game.platform.includes(platformFilter))
    )
    .sort((a, b) =>
      sortOrder === "asc" ? new Date(a.releaseDate) - new Date(b.releaseDate) : new Date(b.releaseDate) - new Date(a.releaseDate)
    );

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentGames = filteredAndSortedGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Container className="mt-4 upcoming-games-page">
      {/* Título */}
      <h2 className="text-center mb-4">Próximos Lanzamientos</h2>

      {/* Filtros */}
      <Row className="mb-3">
        {/* Ordenar por fecha */}
        <Col md={4}>
          <Form.Label>Ordenar por Fecha</Form.Label>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </Form.Select>
        </Col>

        {/* Filtro por género */}
        <Col md={4}>
          <Form.Label>Filtrar por Género</Form.Label>
          <Form.Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
            <option value="">Todos los Géneros</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </Form.Select>
        </Col>

        {/* Filtro por plataforma */}
        <Col md={4}>
          <Form.Label>Filtrar por Plataforma</Form.Label>
          <Form.Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="">Todas las Plataformas</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Lista de juegos */}
      <Row className="g-4">
        {isLoading ? (
          // Spinner mientras se carga
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          currentGames.length > 0 ? (
            currentGames.map((game) => (
              <Col md={12} key={game.id} className="mb-3">
                {/* Tarjeta de juego */}
                <Card
                  className="d-flex flex-row align-items-center p-2"
                  onClick={() => window.location.href = `/games/${game.id}`}
                  style={{ cursor: "pointer" }}
                >
                  {/* Imagen del juego */}
                  <img
                    src={game.coverImage || "https://via.placeholder.com/100x150"}
                    alt={game.title}
                    className="me-3"
                    style={{ width: "100px", height: "150px", objectFit: "cover" }}
                  />
                  {/* Información del juego */}
                  <div className="flex-grow-1">
                    <h5>{game.title}</h5>
                    <p className="mb-0"><strong>Fecha de Lanzamiento:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>
                    <p className="text-muted mb-0">
                      <strong>Género:</strong> {game.genre || "Desconocido"} |{" "}
                      <strong>Plataforma:</strong> {game.platform || "Desconocido"}
                    </p>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">No hay próximos lanzamientos disponibles.</p>
          )
        )}
      </Row>

      {/* Paginación */}
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

          {currentPage > 1 && <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>}
          <Pagination.Item active>{currentPage}</Pagination.Item>
          {currentPage < totalPages && <Pagination.Item onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>}

          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </Container>
  );
}

export default UpcomingGamesPage;