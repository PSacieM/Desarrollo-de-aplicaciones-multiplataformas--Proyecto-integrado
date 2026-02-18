// Importación de librerías y componentes
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosConfig";
import { Card, Container, Row, Button, Modal, Col, Spinner, Pagination } from "react-bootstrap";
import { toast } from 'react-toastify';
import "./UserCommentsPage.css";

// Definición del componente UserCommentsPage
function UserCommentsPage() {

  // Obtención del parámetro de la URL (id del usuario)
  const { userId } = useParams();

  // Estados
  const [comments, setComments] = useState([]);  // Lista de comentarios del usuario
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [editingComment, setEditingComment] = useState(null);  // Comentario que se está editando
  const [editedText, setEditedText] = useState("");  // Texto editado del comentario
  const [expandedComments, setExpandedComments] = useState({});  // Estados de expandido por comentario
  const [sortOrder, setSortOrder] = useState("desc");  // Orden de los comentarios (asc o desc)
  const [currentPage, setCurrentPage] = useState(1);  // Página actual de la paginación
  const [username, setUsername] = useState("");  // Nombre de usuario
  const itemsPerPage = 10;  // Cantidad de comentarios por página
  const navigate = useNavigate();  // Hook para navegación
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false); // Muestra/Oculta modal de eliminación de comentario
  const [commentIdToDelete, setCommentIdToDelete] = useState(null); // Id del comentario a eliminar

  // Efecto para cargar comentarios al cargar la página o cambiar orden
  useEffect(() => {
    const fetchUserComments = async () => {
      try {
        const response = await axios.get(`/api/comments/user/${userId}`);
        const comments = response.data;

        // Se enriquece cada comentario con la portada del juego correspondiente
        const enrichedComments = await Promise.all(
          comments.map(async (comment) => {
            try {
              const gameRes = await axios.get(`/api/games/${comment.gameId}`);
              return {
                ...comment,
                coverImage: gameRes.data.coverImage,
              };
            } catch (error) {
              return { ...comment, coverImage: null };
            }
          })
        );

        // Ordena los comentarios por fecha
        const sorted = enrichedComments.sort((a, b) => {
          const dateA = new Date(a.commentDate);
          const dateB = new Date(b.commentDate);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setComments(sorted);
      } catch (error) {
        console.error("Error al cargar los comentarios del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserComments();
  }, [userId, sortOrder]);

  // Si está cargando, se muestra spinner
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Carga el nombre de usuario
  const fetchUsername = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUsername(response.data.username);
    } catch (error) {
      console.error("Error al obtener el nombre de usuario:", error);
    }
  };

  // Se ejecuta siempre que se renderiza el componente
  fetchUsername();

  // Método para eliminar comentario
  const handleDeleteComment = async () => {
    if (!commentIdToDelete) return;

    try {
      await axios.delete(`/api/comments/${commentIdToDelete}`);
      setComments(prev => prev.filter(c => c.id !== commentIdToDelete));
      toast.success("Comentario eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el comentario:", error);
      toast.error("Error al eliminar el comentario.");
    } finally {
      setShowDeleteCommentModal(false);
      setCommentIdToDelete(null);
    }
  };

  // Alterna expandir o colapsar el comentario
  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Se obtiene el usuario actual y el rol desde localStorage
  const currentUserId = localStorage.getItem("userId");
  const currentUserRole = localStorage.getItem("role");

  // Lógica de paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentComments = comments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(comments.length / itemsPerPage);

  // Cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Renderizado de los botones de paginación
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

  return (
    <Container className="mt-4">

      {/* Título y enlace al perfil del usuario */}
      <h3 className="mb-4">
        Comentarios de{" "}
        <Link to={`/profile/${userId}`} className="text-decoration-none">
          {username || "usuario"}
        </Link>
      </h3>

      {/* Filtros de orden y paginación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>Ordenar por fecha:</strong>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value); // Cambiar orden
              setCurrentPage(1);            // Reiniciar página a 1
            }}
            className="ms-2"
          >
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguos</option>
          </select>
        </div>
        <div>
          Página {currentPage} de {totalPages}
        </div>
      </div>

      {/* Lista de comentarios */}
      <Row>
        {currentComments.length === 0 ? (
          <p className="text-center">Este usuario no tiene comentarios.</p>
        ) : (
          currentComments.map((comment) => (
            <Col key={comment.id} xs={12} className="mb-3">
              <Card
                className="p-3 shadow-sm comment-card hover-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/games/${comment.gameId}`)} // Ir a la página del juego
              >

                {/* Contenedor principal del comentario */}
                <div className="d-flex justify-content-between align-items-start">

                  {/* Parte izquierda: portada del juego + comentario */}
                  <div className="d-flex">
                    <img
                      src={comment.coverImage || "/placeholder-image.jpg"}
                      alt="Portada del juego"
                      className="rounded me-3 comment-game-cover"
                    />
                    <div>
                      {/* Título del juego */}
                      <div className="fw-bold fs-5">{comment.gameTitle}</div>

                      {/* Texto del comentario */}
                      <div className="mt-1 mb-2 comment-text">
                        {comment.commentText.length > 200 && !expandedComments[comment.id]
                          ? `${comment.commentText.slice(0, 200)}...`
                          : comment.commentText}

                        {/* Botón Ver más / Ver menos */}
                        {comment.commentText.length > 200 && (
                          <button
                            className="btn btn-link btn-sm ps-1"
                            style={{ textDecoration: "underline" }}
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que el clic navegue al juego
                              toggleExpand(comment.id);
                            }}
                          >
                            {expandedComments[comment.id] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>

                      {/* Fechas del comentario */}
                      <div className="text-muted small">
                        Publicado: {new Date(comment.commentDate).toLocaleString()}
                        {comment.updatedAt && (
                          <span> | Editado: {new Date(comment.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Parte derecha: botones de editar / eliminar */}
                  <div className="d-flex gap-2">
                    {/* Botón Editar, solo si es el autor */}
                    {currentUserId === comment.userId.toString() && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingComment(comment);
                          setEditedText(comment.commentText);
                        }}
                      >
                        ✏️
                      </button>
                    )}

                    {/* Botón Eliminar, si es el autor o admin */}
                    {(currentUserId === comment.userId.toString() || currentUserRole === "admin") && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCommentIdToDelete(comment.id);
                          setShowDeleteCommentModal(true);
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Paginación */}
      {comments.length > 0 && (
        <Pagination className="mt-4 justify-content-center">
          {renderPagination()}
        </Pagination>
      )}

      {/* Modal de eliminación de comentario */}
      <Modal show={showDeleteCommentModal} onHide={() => setShowDeleteCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCommentModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteComment}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición de comentario */}
      {editingComment && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">

              {/* Cabecera del modal */}
              <div className="modal-header">
                <h5 className="modal-title">Editar comentario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingComment(null)}
                ></button>
              </div>

              {/* Cuerpo del modal */}
              <div className="modal-body">
                <textarea
                  className="form-control"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Footer del modal */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingComment(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    axios
                      .put(`/api/comments/${editingComment.id}`, {
                        commentText: editedText,
                      })
                      .then(() => {
                        setComments(prev =>
                          prev.map(c =>
                            c.id === editingComment.id
                              ? { ...c, commentText: editedText, updatedAt: new Date().toISOString() }
                              : c
                          )
                        );
                        setEditingComment(null);
                        toast.success("Comentario actualizado correctamente.");
                      })
                      .catch(err => {
                        console.error("Error al actualizar el comentario:", err);
                        toast.error("Error al actualizar el comentario.");
                      });
                  }}
                >
                  Guardar cambios
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default UserCommentsPage;