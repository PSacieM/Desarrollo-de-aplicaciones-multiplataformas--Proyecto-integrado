import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import { Container, Tabs, Tab, Button, Modal, Card, Row, Col, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import "./UserListsPage.css";

function UserListsPage() {
  // Obtener userId desde la URL
  const { userId } = useParams();

  // Hook para navegación
  const navigate = useNavigate();

  // Estado para almacenar las listas del usuario
  const [lists, setLists] = useState({
    Jugados: [],
    Jugando: [],
    Pendientes: [],
  });

  // Estado para controlar loading
  const [loading, setLoading] = useState(true);

  // Estado para almacenar el nombre de usuario
  const [username, setUsername] = useState("");

  // Mostrar/Ocultar modal de eliminar
  const [showDeleteGameModal, setShowDeleteGameModal] = useState(false);

  // Juego a eliminar
  const [gameToDelete, setGameToDelete] = useState({ gameInListId: null, listName: "" });

  // useEffect inicial para cargar las listas
  useEffect(() => {
    const fetchLists = async () => {
      try {
        // Obtener datos del usuario
        const userRes = await axios.get(`/api/users/${userId}`);
        setUsername(userRes.data.username);

        // Obtener listas del usuario
        const response = await axios.get(`/api/lists/user/${userId}`);
        const gamesByList = { Jugados: [], Jugando: [], Pendientes: [] };

        // Por cada lista, obtener los juegos correspondientes
        for (const list of response.data) {
          const gamesInListRes = await axios.get(`/api/games-in-lists/list/${list.id}`);

          // Por cada juego en la lista, obtener detalles del juego
          for (const item of gamesInListRes.data) {
            const gameRes = await axios.get(`/api/games/${item.gameId}`);
            const game = gameRes.data;

            // Añadir juego al array de su lista correspondiente
            gamesByList[list.name].push({
              ...game,
              gameId: game.id,
              score: item.score,
              gameInListId: item.id,
            });
          }
        }

        // Actualizar estado con las listas completas
        setLists(gamesByList);
      } catch (error) {
        console.error("Error al cargar listas del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [userId]);

  // Función para eliminar un juego de la lista
  const handleRemoveFromList = async () => {
    try {
      await axios.delete(`/api/games-in-lists/${gameToDelete.gameInListId}`);
      // Actualizar la lista eliminando el juego visualmente
      setLists((prev) => ({
        ...prev,
        [gameToDelete.listName]: prev[gameToDelete.listName].filter(
          (g) => g.gameInListId !== gameToDelete.gameInListId
        ),
      }));
      toast.success("Juego eliminado de la lista correctamente.");
    } catch (error) {
      console.error("Error al eliminar el juego de la lista:", error);
      toast.error("No se pudo eliminar el juego.");
    } finally {
      setShowDeleteGameModal(false);
      setGameToDelete({ gameInListId: null, listName: "" });
    }
  };

  // Mostrar spinner mientras se carga la página
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Renderizado de la página
  return (
    <Container className="mt-4">
      <h3 className="mb-4">
        Listas de{" "}
        <a href={`/profile/${userId}`} className="text-decoration-none">
          {username || "usuario"}
        </a>
      </h3>

      {/* Pestañas para las listas */}
      <Tabs
        defaultActiveKey="Jugados"
        id="user-lists-tabs"
        className="mb-4 justify-content-center"
        justify
      >
        {/* Renderizar cada pestaña */}
        {["Jugados", "Jugando", "Pendientes"].map((listName) => (
          <Tab eventKey={listName} title={listName} key={listName}>
            {/* Si la lista está vacía */}
            {lists[listName].length === 0 ? (
              <p className="text-center mt-3">No hay juegos en esta lista.</p>
            ) : (
              // Mostrar lista de juegos
              <Row className="mt-3">
                {lists[listName].map((game) => (
                  <Col xs={12} key={game.gameId} className="mb-3">
                    <Card
                      className="shadow-sm p-3 hover-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/games/${game.gameId}`)}
                    >
                      <div className="d-flex align-items-center justify-content-between user-list-card">

                        {/* Portada + información */}
                        <div className="d-flex align-items-center">
                          <img
                            src={game.coverImage || "/placeholder-image.jpg"}
                            alt={game.title}
                            style={{ width: "80px", height: "120px", objectFit: "cover" }}
                            className="me-3 user-list-cover"
                          />
                          <div className="user-list-info">
                            <h5 className="mb-1">{game.title}</h5>
                            <small className="text-muted">
                              {game.genre} | {game.platform}
                            </small>
                          </div>
                        </div>

                        {/* Puntuación + botón de eliminar */}
                        <div className="d-flex flex-column align-items-end user-list-actions">
                          {game.score && (
                            <span className="badge bg-primary fs-5 p-2 mb-2 user-list-score">
                              ⭐ {game.score}
                            </span>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGameToDelete({ gameInListId: game.gameInListId, listName });
                              setShowDeleteGameModal(true);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        ))}
      </Tabs>

      {/* Modal de eliminación de juego */}
      <Modal show={showDeleteGameModal} onHide={() => setShowDeleteGameModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres quitar este juego de la lista? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteGameModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleRemoveFromList}>
            Quitar
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default UserListsPage;