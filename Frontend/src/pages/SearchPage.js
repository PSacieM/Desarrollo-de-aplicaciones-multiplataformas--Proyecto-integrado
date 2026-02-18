import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, Form, Container, Row, Col, Pagination } from "react-bootstrap";
import "./SearchPage.css";

function SearchPage() {
  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState(""); /* Texto de búsqueda */
  const [searchType, setSearchType] = useState("games"); /* Tipo de búsqueda (games o users) */
  const [searchResults, setSearchResults] = useState([]); /* Resultados de la búsqueda */
  const [isLoading, setIsLoading] = useState(false); /* Indicador de carga */
  const [orderBy, setOrderBy] = useState("default"); /* Criterio de ordenación */
  const [sortDirection, setSortDirection] = useState("asc"); /* Dirección de ordenación */
  const [genreFilter, setGenreFilter] = useState(""); /* Filtro por género */
  const [platformFilter, setPlatformFilter] = useState(""); /* Filtro por plataforma */
  const [genres, setGenres] = useState([]); /* Lista de géneros */
  const [platforms, setPlatforms] = useState([]); /* Lista de plataformas */
  const [currentPage, setCurrentPage] = useState(1); /* Página actual */
  const [totalPages, setTotalPages] = useState(1); /* Total de páginas */
  const location = useLocation(); /* Ubicación actual en la URL */
  const navigate = useNavigate(); /* Navegación */
  const ITEMS_PER_PAGE = 10; /* Elementos por página */

  // useEffect: inicializa la página leyendo parámetros de la URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query") || "";
    const type = queryParams.get("type") || "games";
    const order = queryParams.get("orderBy") || "default";
    const direction = queryParams.get("sortDirection") || "asc";
    const genre = queryParams.get("genre") || "";
    const platform = queryParams.get("platform") || "";
    const page = parseInt(queryParams.get("page")) || 1;

    // Cargamos los estados
    setSearchQuery(query);
    setSearchType(type);
    setOrderBy(order);
    setSortDirection(direction);
    setGenreFilter(genre);
    setPlatformFilter(platform);
    setCurrentPage(page);

    // Si hay consulta, la lanzamos
    if (query) {
      performSearch(query, type, order, direction, genre, platform, page);
    }
    // Cargamos los filtros
    fetchGenresAndPlatforms();
  }, [location.search]);

  // Función para obtener géneros y plataformas
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

  // Función para realizar la búsqueda
  const performSearch = async (query, type, order, direction, genre, platform, page) => {
    setIsLoading(true);
    try {
      let response;

      // Si estamos buscando usuarios
      if (type === "users") {
        response = await axios.get(`/api/users/search?username=${query}`);
        const results = response.data;
        setTotalPages(Math.ceil(results.length / 25)); // 25 usuarios por página
        let finalResults = results.slice((page - 1) * 25, page * 25);

        // Orden por defecto descendente
        if (order === "default" && direction === "desc") {
          finalResults = finalResults.reverse();
        }

        // Mapear resultados de usuarios
        setSearchResults(finalResults.map(user => ({
          id: user.id,
          title: user.username,
          coverImage: user.avatarUrl || "https://via.placeholder.com/150",
          role: user.roleName || "Usuario",
          isUser: true
        })));

      } else {
        // Si estamos buscando juegos
        response = await axios.get(`/api/games/search?title=${query}`);
        let results = response.data;

        // Filtrado por género
        if (genre) {
          results = results.filter((game) => game.genre.includes(genre));
        }

        // Filtrado por plataforma
        if (platform) {
          results = results.filter((game) => game.platform.includes(platform));
        }

        // Ordenación
        if (order !== "default") {
          results.sort((a, b) => {
            if (order === "title") {
              return direction === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            } else if (order === "releaseDate") {
              return direction === "asc"
                ? new Date(a.releaseDate) - new Date(b.releaseDate)
                : new Date(b.releaseDate) - new Date(a.releaseDate);
            }
            return 0;
          });
        } else if (direction === "desc") {
          results = results.reverse(); // Por defecto, pero descendente
        }

        // Paginación de juegos
        setTotalPages(Math.ceil(results.length / 10)); // 10 juegos por página
        setSearchResults(results.slice((page - 1) * 10, page * 10));
      }

    } catch (error) {
      console.error("Error al buscar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar la URL con los parámetros de la búsqueda
  const updateURL = (
    page = 1,
    updatedPlatformFilter = platformFilter,
    updatedGenreFilter = genreFilter,
    updatedOrderBy = orderBy,
    updatedSortDirection = sortDirection
  ) => {
    const params = new URLSearchParams(location.search);

    params.set("type", searchType);

    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (updatedOrderBy) params.set("orderBy", updatedOrderBy);
    if (updatedSortDirection) params.set("sortDirection", updatedSortDirection);
    if (updatedGenreFilter) params.set("genre", updatedGenreFilter);
    else params.delete("genre");
    if (updatedPlatformFilter) params.set("platform", updatedPlatformFilter);
    else params.delete("platform");
    if (page) params.set("page", page);

    navigate(`/search?${params.toString()}`);
  };


  // Cambiar página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(page);
  };

  // Manejar click en tarjeta de juego
  const handleCardClick = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  // Cambiar el tipo de búsqueda
  const handleSearchTypeChange = (e) => {
    const newType = e.target.value;
    setSearchType(newType);

    const params = new URLSearchParams(location.search);
    params.set("type", newType);

    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (orderBy) params.set("orderBy", orderBy);
    if (sortDirection) params.set("sortDirection", sortDirection);
    if (genreFilter) params.set("genre", genreFilter);
    if (platformFilter) params.set("platform", platformFilter);
    if (currentPage) params.set("page", currentPage);

    navigate(`/search?${params.toString()}`);
  };

  // Renderizado de paginación
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

    if (currentPage > 3) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    paginationItems.push(
      <Pagination.Item key={currentPage} active>{currentPage}</Pagination.Item>
    );

    if (currentPage < totalPages - 2) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

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

  return (
    <Container className="mt-4 search-page" style={{ minHeight: "70vh" }}>

      {/* Título de la página */}
      <h2 className="text-center mb-4">Resultados de la Búsqueda</h2>

      {/* Filtros y Ordenación */}
      <Row className="mb-3">

        {/* Selector de tipo de búsqueda */}
        <Col md={12}>
          <Form.Label>Buscar</Form.Label>
          <Form.Select className="form-select" value={searchType} onChange={handleSearchTypeChange}>
            <option value="games">Juegos</option>
            <option value="users">Usuarios</option>
          </Form.Select>
        </Col>

        {/* Selector de orden */}
        <Col md={4}>
          <Form.Group>
            <Form.Label>Ordenar por</Form.Label>
            <Form.Select
              className="form-select"
              value={orderBy}
              onChange={(e) => {
                const value = e.target.value;
                setOrderBy(value);
                updateURL(1, platformFilter, genreFilter, value, sortDirection);
              }}
            >
              <option value="default">Por Defecto</option>
              <option value="title">Título</option>
              <option value="releaseDate">Fecha de Lanzamiento</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Selector de dirección */}
        <Col md={4}>
          <Form.Group>
            <Form.Label>Dirección</Form.Label>
            <Form.Select
              className="form-select"
              value={sortDirection}
              onChange={(e) => {
                const value = e.target.value;
                setSortDirection(value);
                updateURL(1, platformFilter, genreFilter, orderBy, value);
              }}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Selector de plataforma */}
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por Plataforma</Form.Label>
            <Form.Select
              className="form-select"
              value={platformFilter}
              onChange={(e) => {
                const value = e.target.value;
                setPlatformFilter(value);
                updateURL(1, value, genreFilter);
              }}
            >
              <option value="">Todas las Plataformas</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Filtro por género */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por Género</Form.Label>
            <Form.Select
              className="form-select"
              value={genreFilter}
              onChange={(e) => {
                const value = e.target.value;
                setGenreFilter(value);
                updateURL(1, platformFilter, value);
              }}
            >
              <option value="">Todos los Géneros</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Resultados de la búsqueda */}
      <div className="mb-4" style={{ minHeight: "50vh" }}>
        {isLoading ? (
          <p className="text-center mt-4">Cargando resultados...</p>
        ) : searchResults.length > 0 ? (

          /* Si es búsqueda de usuarios */
          searchType === "users" ? (
            <div className="user-grid">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="user-card"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    src={user.coverImage}
                    alt={user.title}
                    style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
                  />
                  <h5 className="mb-1" style={{ fontSize: "1rem" }}>{user.title}</h5>
                  <small style={{ color: "#666" }}>{user.role}</small>
                </div>
              ))}
            </div>
          ) : (

            /* Si es búsqueda de juegos */
            <div>
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="game-card mb-3 shadow-sm d-flex align-items-center p-2"
                  onClick={() => navigate(`/games/${result.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={result.coverImage || "https://via.placeholder.com/100x150"}
                    alt={result.title}
                    className="game-thumbnail"
                    style={{ width: "100px", height: "auto", objectFit: "cover" }}
                  />
                  <Card.Body className="ms-3">
                    <h5 className="fw-bold">{result.title}</h5>
                    <p><strong>Género:</strong> {result.genre || "N/A"}</p>
                    <p><strong>Plataforma:</strong> {result.platform || "N/A"}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )

        ) : (
          /* Si no hay resultados */
          <p className="text-center mt-4">No se encontraron resultados.</p>
        )}
      </div>

      {/* Paginación completa */}
      <div className="d-flex justify-content-center mt-4 mb-5">
        <Pagination>{renderPagination()}</Pagination>
      </div>

    </Container>
  );
}

export default SearchPage;