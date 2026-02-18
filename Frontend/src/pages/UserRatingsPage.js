import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import { Container, Row, Col, Card, Spinner, Pagination } from "react-bootstrap";
import "./UserRatingsPage.css";

function UserRatingsPage() {
  const { userId } = useParams();  // ID del usuario desde la URL
  const navigate = useNavigate();   // Hook para navegación programática

  const [ratings, setRatings] = useState([]);  // Puntuaciones del usuario
  const [loading, setLoading] = useState(true);  // Indicador de carga
  const [sortOrder, setSortOrder] = useState("desc");  // Orden de puntuaciones
  const [currentPage, setCurrentPage] = useState(1);  // Página actual de paginación
  const [username, setUsername] = useState("");  // Nombre de usuario

  const itemsPerPage = 10;  // Elementos por página

  // Carga de puntuaciones y datos del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener puntuaciones y datos del usuario en paralelo
        const [scoresResponse, userResponse] = await Promise.all([
          axios.get(`/api/scores/user/${userId}`),
          axios.get(`/api/users/${userId}`)
        ]);

        setUsername(userResponse.data.username);

        const ratings = scoresResponse.data;

        // Enriquecer las puntuaciones con datos del juego
        const enrichedRatings = await Promise.all(
          ratings.map(async (rating) => {
            try {
              const gameRes = await axios.get(`/api/games/${rating.gameId}`);
              return {
                ...rating,
                gameTitle: gameRes.data.title,
                coverImage: gameRes.data.coverImage,
                genre: gameRes.data.genre,
                platform: gameRes.data.platform,
              };
            } catch {
              // Si no se encuentra el juego
              return { ...rating, gameTitle: "Juego no encontrado" };
            }
          })
        );

        // Ordenar las puntuaciones según el orden seleccionado
        const sorted = enrichedRatings.sort((a, b) =>
          sortOrder === "asc" ? a.score - b.score : b.score - a.score
        );

        setRatings(sorted);
      } catch (error) {
        console.error("Error al cargar puntuaciones o usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, sortOrder]);

  // Cálculo de paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRatings = ratings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(ratings.length / itemsPerPage);

  // Cambiar página actual
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Renderizar paginación
  const renderPagination = () => {
    const paginationItems = [];

    if (currentPage > 1) {
      paginationItems.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />,
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />
      );
    }

    if (currentPage > 2) {
      paginationItems.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>
      );
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

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Render principal de la página
  return (
    <Container className="mt-4">
      
      {/* Cabecera con título y selector de orden */}
      <div className="d-flex justify-content-between align-items-center mb-3 user-ratings-header">
        <h3 className="mb-0">
          Puntuaciones de{" "}
          <a href={`/profile/${userId}`} className="text-decoration-none">
            {username || "usuario"}
          </a>
        </h3>

        <div>
          <strong>Ordenar por puntuación:</strong>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1); // Volver a página 1 al cambiar el orden
            }}
            className="ms-2"
          >
            <option value="desc">Mayor a menor</option>
            <option value="asc">Menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Lista de puntuaciones */}
      <Row>
        {currentRatings.length === 0 ? (
          <p className="text-center">Este usuario no tiene puntuaciones registradas.</p>
        ) : (
          currentRatings.map((rating) => (
            <Col xs={12} className="mb-3" key={rating.id}>
              <Card
                className="p-3 shadow-sm hover-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/games/${rating.gameId}`)}
              >
                <div className="d-flex align-items-center justify-content-between rating-card">
                  
                  {/* Info del juego */}
                  <div className="d-flex align-items-center rating-info">
                    <img
                      src={rating.coverImage || "/placeholder-image.jpg"}
                      alt="Portada"
                      className="rating-cover me-3"
                    />
                    <div>
                      <h5 className="mb-1">{rating.gameTitle}</h5>
                      <small className="text-muted">
                        {rating.genre} | {rating.platform}
                      </small>
                    </div>
                  </div>

                  {/* Caja de puntuación */}
                  <div className="rating-score-box">
                    <span>{rating.score}</span>
                  </div>

                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Paginación */}
      {ratings.length > 0 && (
        <Pagination className="mt-4 justify-content-center">
          {renderPagination()}
        </Pagination>
      )}

    </Container>
  );
}

export default UserRatingsPage;