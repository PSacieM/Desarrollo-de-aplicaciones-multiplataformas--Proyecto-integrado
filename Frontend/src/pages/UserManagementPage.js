import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { Card, Container, Row, Col, Button, Modal, Form, Dropdown, Pagination } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "./UserManagementPage.css";

function UserManagementPage() {

  // Definición de estados
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [comments, setComments] = useState([]); // Lista de comentarios
  const [viewMode, setViewMode] = useState("Usuarios"); // Modo de vista actual
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [sortOrder, setSortOrder] = useState("desc"); // Orden de comentarios
  const [expandedComments, setExpandedComments] = useState({}); // Estado de comentarios expandidos
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false); // Muestra/Oculta el modal de eliminar comentario
  const [commentIdToDelete, setCommentIdToDelete] = useState(null); // Id del comentario a borrar

  const navigate = useNavigate();
  const itemsPerPage = 10; // Elementos por página

  // useEffect para cargar datos cuando cambia el modo de vista o el orden
  useEffect(() => {
    if (viewMode === "Usuarios") {
      fetchUsers(); // Cargar usuarios
    } else {
      fetchComments(); // Cargar comentarios
    }
  }, [viewMode, sortOrder]);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data); // Actualiza el estado con la lista de usuarios
      setTotalPages(Math.ceil(response.data.length / itemsPerPage)); // Calcula el total de páginas
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Función para obtener comentarios
  const fetchComments = async () => {
    try {
      const response = await axios.get("/api/comments");
      const sortedComments = response.data.sort((a, b) => {
        const dateA = new Date(a.commentDate);
        const dateB = new Date(b.commentDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
      setComments(sortedComments); // Actualiza el estado con la lista ordenada de comentarios
      console.log("Comentarios cargados:", sortedComments);
      setTotalPages(Math.ceil(sortedComments.length / itemsPerPage)); // Calcula el total de páginas
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  };

  // Función para eliminar un comentario
  const handleDeleteComment = async () => {
    try {
      await axios.delete(`/api/comments/${commentIdToDelete}`);
      toast.success("Comentario eliminado correctamente.");
      fetchComments(); // Recargar comentarios tras eliminar
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("Error al eliminar el comentario.");
    } finally {
      setShowDeleteCommentModal(false);
      setCommentIdToDelete(null);
    }
  };

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  // Función para expandir/colapsar comentario
  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calcular índices de elementos actuales
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = viewMode === "Usuarios"
    ? users.slice(indexOfFirstItem, indexOfLastItem)
    : comments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Container className="mt-4">
      {/* Título de la página */}
      <h2 className="mb-4 text-center">Gestión de Usuarios y Comentarios</h2>

      {/* Selector de modo de vista (Usuarios o Comentarios) */}
      <Form.Select
        className="mb-3"
        value={viewMode}
        onChange={(e) => {
          setViewMode(e.target.value); // Cambiar vista
          setCurrentPage(1); // Resetear a página 1
        }}
      >
        <option value="Usuarios">Usuarios</option>
        <option value="Comentarios">Comentarios</option>
      </Form.Select>

      {/* Filtro de orden de comentarios (solo en vista Comentarios) */}
      {viewMode === "Comentarios" && (
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Form.Label>Ordenar por fecha:</Form.Label>
          <Form.Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)} // Cambiar orden
            style={{ width: "150px" }}
          >
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguos</option>
          </Form.Select>
        </div>
      )}

      {/* Renderizado de Usuarios */}
      {viewMode === "Usuarios" && (
        <div className="user-grid">
          {currentItems.map((user) => (
            <div
              className="user-card"
              key={user.id}
              onClick={() => navigate(`/profile/${user.id}`)} // Navegar al perfil del usuario
              style={{ cursor: "pointer" }}
            >
              <img
                src={user.avatarUrl || "https://via.placeholder.com/80"}
                alt={`Avatar de ${user.username}`}
                className="user-avatar"
              />
              <div className="user-name">{user.username}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-role">
                Rol: <strong>{user.roleName?.toUpperCase()}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderizado de Comentarios */}
      {viewMode === "Comentarios" && (
        <Row className="g-4">
          {currentItems.length > 0 ? (
            currentItems.map((comment) => (
              <Col md={12} key={comment.id}>
                <Card
                  className="comment-card shadow-sm mb-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/user/${comment.userId}/comments`)} // Navegar a comentarios del usuario
                >
                  <Card.Body className="d-flex align-items-start">
                    {/* Avatar del usuario */}
                    <img
                      src={comment.avatarUrl || "https://via.placeholder.com/50"}
                      alt="Avatar del usuario"
                      className="user-avatar me-3"
                      style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                    />

                    {/* Contenido del comentario */}
                    <div className="flex-grow-1">
                      <h5 className="mb-0">{comment.username || "Usuario desconocido"}</h5>
                      <small className="text-muted">
                        Publicado: {new Date(comment.commentDate).toLocaleString()}
                        {comment.updatedAt && (
                          <> | Editado: {new Date(comment.updatedAt).toLocaleString()}</>
                        )}
                      </small>

                      <div className="mt-2 comment-text">
                        {comment.commentText.length > 200 && !expandedComments[comment.id]
                          ? `${comment.commentText.slice(0, 200)}...`
                          : comment.commentText}

                        {comment.commentText.length > 200 && (
                          <button
                            className="btn btn-link btn-sm ps-1"
                            style={{ textDecoration: "underline" }}
                            onClick={(e) => {
                              e.stopPropagation(); // No navegar al perfil al pulsar botón
                              toggleExpand(comment.id); // Expandir/contraer texto
                            }}
                          >
                            {expandedComments[comment.id] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Botón para eliminar comentario */}
                    <Button
                      variant="danger"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCommentIdToDelete(comment.id);
                        setShowDeleteCommentModal(true);
                      }}
                    >
                      🗑️
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">No hay comentarios disponibles.</p>
          )}
        </Row>
      )}

      {/* Paginación */}
      <Pagination className="mt-4 justify-content-center">
        {renderPagination()}
      </Pagination>

      {/* Modal de confirmación de eliminación de comentario */}
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

    </Container>
  );
}

export default UserManagementPage;