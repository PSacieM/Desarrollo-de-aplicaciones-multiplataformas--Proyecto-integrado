import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Badge, Spinner, Pagination, Form } from "react-bootstrap";
import "./Top100Page.css";

function Top100Page() {

  /* Estados */
  const [topGames, setTopGames] = useState([]); /* Lista completa de juegos */
  const [filteredGames, setFilteredGames] = useState([]); /* Lista filtrada y ordenada */
  const [isLoading, setIsLoading] = useState(true); /* Estado de carga */
  const [currentPage, setCurrentPage] = useState(1); /* Página actual */
  const [sortDirection, setSortDirection] = useState("desc"); /* Dirección de ordenación */
  const [genreFilter, setGenreFilter] = useState(""); /* Filtro por género */
  const [platformFilter, setPlatformFilter] = useState(""); /* Filtro por plataforma */
  const [genres, setGenres] = useState([]); /* Lista de géneros */
  const [platforms, setPlatforms] = useState([]); /* Lista de plataformas */
  const ITEMS_PER_PAGE = 10; /* Juegos por página */
  const navigate = useNavigate();

  /* Efecto para cargar Top 100 inicial */
  useEffect(() => {
    fetchTop100Games();
  }, []);

  /* Efecto para filtrar y ordenar cuando cambian filtros u orden */
  useEffect(() => {
    filterAndSortGames();
  }, [topGames, genreFilter, platformFilter, sortDirection]);

  /* Obtener los Top 100 juegos desde la API */
  const fetchTop100Games = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (genreFilter) params.genre = genreFilter;
      if (platformFilter) params.platform = platformFilter;

      const response = await axios.get("/api/games/top100", { params });
      const top100 = response.data;

      /* Guardamos los juegos y generamos lista de géneros y plataformas únicas */
      setTopGames(top100);
      setGenres([...new Set(top100.map(game => game.genre).filter(Boolean))]);
      setPlatforms([...new Set(top100.map(game => game.platform).filter(Boolean))]);
    } catch (error) {
      console.error("Error al obtener el Top 100 de juegos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* Filtrar y ordenar juegos */
  const filterAndSortGames = () => {
    let filtered = [...topGames];

    if (genreFilter) {
      filtered = filtered.filter(game => game.genre.includes(genreFilter));
    }
    if (platformFilter) {
      filtered = filtered.filter(game => game.platform.includes(platformFilter));
    }

    /* Ordenar por puntuación */
    filtered.sort((a, b) => {
      const scoreA = parseFloat(a.averageScore) || 0;
      const scoreB = parseFloat(b.averageScore) || 0;
      return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
    });

    setFilteredGames(filtered);
    setCurrentPage(1);
  };

  /* Cambio de página en la paginación */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /* Cálculo del rango de juegos a mostrar */
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);

  /* Renderizar paginación */
  const renderPagination = () => {
    const paginationItems = [];

    if (currentPage > 1) {
      paginationItems.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />,
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />
      );
    }

    if (currentPage > 2) {
      paginationItems.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
    }

    paginationItems.push(
      <Pagination.Item key={currentPage} active>{currentPage}</Pagination.Item>
    );

    if (currentPage < totalPages - 1) {
      paginationItems.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages) {
      paginationItems.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />,
        <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />
      );
    }

    return paginationItems;
  };

  /* Mostrar spinner de carga */
  if (isLoading) {
    return (
      <div className="loading-spinner d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  /* Render principal de la página */
  return (
    <Container className="mt-4 top-100-page">
      <h2 className="text-center mb-4">Top 100 Mejores Juegos</h2>

      {/* Filtros */}
      <Row className="mb-3 gx-3 gy-2">
        {/* Filtro de dirección */}
        <Col md={4}>
          <div className="position-relative">
            <Form.Select
              className="form-select custom-select-dropdown"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <option value="desc">Descendente (Mejor Puntuados)</option>
              <option value="asc">Ascendente (Peor Puntuados)</option>
            </Form.Select>
          </div>
        </Col>

        {/* Filtro por género */}
        <Col md={4}>
          <div className="position-relative">
            <Form.Select
              className="form-select custom-select-dropdown"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <option value="">Todos los Géneros</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.length > 30 ? genre.slice(0, 30) + "..." : genre}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>

        {/* Filtro por plataforma */}
        <Col md={4}>
          <div className="position-relative">
            <Form.Select
              className="form-select custom-select-dropdown"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <option value="">Todas las Plataformas</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform.length > 30 ? platform.slice(0, 30) + "..." : platform}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Lista de juegos */}
      <Row className="g-3">
        {currentGames.map((game, index) => (
          <Col md={12} key={game.gameId} className="d-flex align-items-center position-relative mb-3">
            <div className="ranking-number me-3">{startIndex + index + 1}.</div>
            <Card className="flex-grow-1 p-2 shadow-sm" onClick={() => navigate(`/games/${game.gameId}`)} style={{ cursor: "pointer" }}>
              <div className="d-flex align-items-center">
                <img src={game.coverImage} alt={game.gameTitle} style={{ width: "80px", height: "120px", objectFit: "cover" }} className="me-3" />
                <div>
                  <h5>{game.gameTitle}</h5>
                  <p className="mb-0 text-muted">{game.genre} | {game.platform}</p>
                </div>
                <Badge bg="primary" className="ms-auto game-score">
                  {game.averageScore !== null ? `⭐ ${game.averageScore.toFixed(1)}` : "N/A"}
                </Badge>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Paginación */}
      <Pagination className="mt-4 justify-content-center">{renderPagination()}</Pagination>
    </Container>
  );
}

export default Top100Page;