import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import jsPDF from "jspdf";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Button, Form, ListGroup, Row, Col, Alert, Badge, Modal, Pagination } from "react-bootstrap";
import { toast } from 'react-toastify';
import "./GameDetailsPage.css";

function GameDetailsPage() {
  // Obtiene el ID del juego desde la URL
  const { id } = useParams();

  const navigate = useNavigate();

  // Estados generales
  const [game, setGame] = useState(null); // Detalles del juego
  const [comments, setComments] = useState([]); // Lista de comentarios de otros usuarios
  const [userComment, setUserComment] = useState(null); // Comentario del usuario actual (si existe)
  const [newComment, setNewComment] = useState(""); // Nuevo comentario que se está escribiendo
  const [rating, setRating] = useState(""); // Valor actual de puntuación del usuario
  const [averageRating, setAverageRating] = useState("N/A"); // Puntuación media del juego
  const [userRating, setUserRating] = useState(null); // Puntuación del usuario actual
  const [showModalList, setShowModalList] = useState(false); // Mostrar/ocultar modal de listas
  const [showModalRating, setShowModalRating] = useState(false); // Mostrar/ocultar modal de puntuación
  const [selectedList, setSelectedList] = useState(""); // Lista seleccionada para guardar el juego
  const [editingComment, setEditingComment] = useState(""); // Texto del comentario en edición
  const [showEditForm, setShowEditForm] = useState(false); // Mostrar/ocultar formulario de edición de juego
  const [editedGame, setEditedGame] = useState({}); // Datos editables del juego
  const [expandedComments, setExpandedComments] = useState({}); // Control de comentarios expandidos
  const [savedListName, setSavedListName] = useState(null); // Nombre de la lista en la que está el juego
  const [translatedDescription, setTranslatedDescription] = useState(null); // Descripción traducida
  const [showTranslation, setShowTranslation] = useState(false); // Mostrar/ocultar traducción
  const [originalDescription, setOriginalDescription] = useState(null); // Descripción original
  const [isEditing, setIsEditing] = useState(false); // Estado de edición de comentario
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1); // Página actual de comentarios (paginación)
  const [commentError, setCommentError] = useState(""); // Estado que muestra el error
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Muestra/Oculta el modal para eliminar el juego
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false); // Muestra/Oculta el modal para eliminar el comentario
  const [commentIdToDelete, setCommentIdToDelete] = useState(null); // Id del comentario a borrar

  // Variables auxiliares
  const isAuthenticated = !!localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");
  const COMMENTS_PER_PAGE = 10;

  console.log("Usuario Rol:", userRole);

  // Efecto inicial → carga datos al cargar el componente o cambiar de juego
  useEffect(() => {
    fetchGameDetails();
    fetchComments();
    fetchAverageRating();
    fetchUserRating();

    if (userId) {
      fetchSavedListName();
    }

    // Intervalo para refrescar comentarios automáticamente cada 15 segundos
    const interval = setInterval(() => {
      fetchComments();
    }, 15000);

    // Limpia el intervalo cuando se desmonta el componente
    return () => clearInterval(interval);
  }, [id]);

  // Cuando cambian los comentarios, reinicia a la página 1
  useEffect(() => {
    setCurrentCommentsPage(1);
  }, [comments]);

  // Obtener detalles del juego
  const fetchGameDetails = async () => {
    try {
      const response = await axios.get(`/api/games/${id}`);
      setGame(response.data);
      setEditedGame(response.data);
      setOriginalDescription(response.data.description);
    } catch (error) {
      console.error("Error al obtener detalles del juego:", error);
    }
  };

  // Obtener comentarios
  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/game/${id}`);
      const allComments = response.data;

      // Separa el comentario del usuario actual del resto
      const userComment = allComments.find(comment => comment.userId?.toString() === userId);
      const otherComments = allComments.filter(comment => comment.userId?.toString() !== userId);

      setUserComment(userComment || null);
      setComments(otherComments);

    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  };

  // Cálculo de la paginación
  const totalCommentsPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const startIndex = (currentCommentsPage - 1) * COMMENTS_PER_PAGE;
  const paginatedComments = comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);

  // Obtener puntuación media
  const fetchAverageRating = async () => {
    try {
      const response = await axios.get(`/api/scores/game/${id}/average`);
      setAverageRating(response.data ? response.data.toFixed(1) : "N/A");
    } catch (error) {
      console.error("Error al obtener la puntuación media:", error);
    }
  };

  // Obtener puntuación del usuario
  const fetchUserRating = async () => {
    try {
      if (!userId) return;

      const response = await axios.get(`/api/scores/user/${userId}/game/${id}`);

      if (response.status === 200) {
        console.log("Puntuación del usuario:", response.data);
        setUserRating(response.data);
        setRating(response.data.score || 0);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("El usuario no tiene puntuación para este juego.");
        setUserRating(null);
        setRating(0);
      } else {
        console.error("Error al obtener la puntuación del usuario:", error);
      }
    }
  };

  // Verificar si el juego está en alguna lista del usuario
  const fetchSavedListName = async () => {
    try {
      const res = await axios.get(`/api/lists/user/${userId}`);
      const allLists = res.data;

      for (const list of allLists) {
        const gamesInListRes = await axios.get(`/api/games-in-lists/list/${list.id}`);
        const gamesInList = gamesInListRes.data;

        const found = gamesInList.find(item => item.gameId === parseInt(id));
        if (found) {
          setSavedListName(list.name);
          return;
        }
      }

      setSavedListName(null);
    } catch (error) {
      console.error("Error al comprobar si el juego está guardado:", error);
    }
  };

  // Traducir descripción del juego
  const fetchTranslation = async () => {
    if (!game || !game.description) return;

    try {
      const limitedText = game.description.substring(0, 500);
      const response = await axios.post("/api/translate", {
        text: limitedText,
      });

      setTranslatedDescription(response.data.translatedText);
      setShowTranslation(true);
    } catch (error) {
      console.error("Error al traducir:", error.message);
      toast.error("Error al traducir la descripción.");
    }
  };

  // Enviar nuevo comentario
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentError("Debes iniciar sesión para comentar.");
      return;
    }

    if (newComment.trim() === "") {
      setCommentError("El comentario no puede estar vacío.");
      return;
    }

    try {
      await axios.post(`/api/comments`, {
        gameId: id,
        commentText: newComment,
      });
      setNewComment("");
      fetchComments();
      setCommentError(""); // Limpia el error si todo fue bien
      toast.success("Comentario enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast.error("Error al enviar el comentario.");
    }
  };

  // Añadir juego a una lista del usuario
  const handleAddToList = async () => {
    if (!selectedList) return;

    try {
      const listsRes = await axios.get(`/api/lists/user/${userId}`);
      const lists = listsRes.data;

      const targetList = lists.find((list) => list.name === selectedList);

      if (!targetList) {
        toast.error("No se encontró la lista seleccionada.");
        return;
      }

      await axios.post(`/api/games-in-lists`, null, {
        params: {
          listId: targetList.id,
          gameId: id,
        },
      });

      toast.success(`Juego guardado correctamente en la lista: ${selectedList}. Si estaba en otra lista, se ha movido.`);

      await fetchSavedListName();

      setShowModalList(false);
    } catch (error) {
      console.error("Error al añadir el juego a la lista:", error);
      toast.error("No se pudo añadir el juego. Asegúrate de no haberlo añadido ya.");
    }
  };

  // Editar comentario
  const handleEditComment = async () => {
    if (editingComment.trim() === "") {
      setCommentError("El comentario no puede estar vacío.");
      return;
    }

    try {
      await axios.put(`/api/comments/${userComment.id}`, {
        commentText: editingComment,
      });
      setEditingComment("");
      setIsEditing(false);
      setCommentError(""); // Limpia el error si va bien
      fetchComments();
      toast.success("Comentario editado correctamente.");
    } catch (error) {
      console.error("Error al editar comentario:", error);
      toast.error("Error al editar el comentario.");
    }
  };

  // Eliminar comentario
  const handleDeleteComment = async () => {
    try {
      await axios.delete(`/api/comments/${userComment.id}`);
      setUserComment(null);
      fetchComments();
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
    }
  };

  // Enviar nueva puntuación
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      toast.error("Error al guardar la puntuación.");
      return;
    }

    try {
      if (userRating) {
        await axios.put(`/api/scores/${userRating.id}`, {
          score: rating,
        });
      } else {
        await axios.post(`/api/scores`, {
          gameId: id,
          score: rating,
        });
      }
      setShowModalRating(false);
      fetchUserRating();
      fetchAverageRating();
    } catch (error) {
      console.error("Error al guardar puntuación:", error);
    }
  };

  // Eliminar puntuación
  const handleDeleteRating = async () => {
    if (!userRating) return;

    try {
      await axios.delete(`/api/scores/${userRating.id}`);
      setUserRating(null);
      setRating(0);
      fetchAverageRating();
      setShowModalRating(false);
    } catch (error) {
      console.error("Error al eliminar puntuación:", error);
    }
  };

  // Eliminar juego (ADMIN)
  const handleDeleteGame = async () => {
    try {
      await axios.delete(`/api/games/${id}`);
      toast.success("Juego eliminado correctamente.");
      setShowDeleteModal(false); // Cierra el modal
      navigate("/");
    } catch (error) {
      console.error("Error al eliminar juego:", error);
      toast.error("Error al eliminar el juego.");
    }
  };

  // Editar juego (ADMIN)
  const handleEditGame = async () => {
    try {
      await axios.put(`/api/games/${id}`, editedGame);
      toast.success("Juego actualizado correctamente.");
      fetchGameDetails();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error al editar juego:", error);
      toast.error("Error al editar el juego.");
    }
  };

  // Actualizar campos del formulario de edición del juego
  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedGame((prev) => ({ ...prev, [name]: value }));
  };

  // Eliminar comentario (ADMIN)
  const handleDeleteCommentByAdmin = async () => {
    if (!commentIdToDelete) return;

    try {
      await axios.delete(`/api/comments/${commentIdToDelete}`);
      fetchComments();
      toast.success("Comentario eliminado correctamente.");
      setShowDeleteCommentModal(false); // Cierra el modal
      setCommentIdToDelete(null);
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("Error al eliminar el comentario.");
      setShowDeleteCommentModal(false); // Cierra el modal aunque haya error
      setCommentIdToDelete(null);
    }
  };

  // Función para descargar los detalles del juego en formato PDF
  const handleDownloadPDF = () => {
    if (!game) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // TÍTULO del juego en negrita y centrado
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    const title = game.title;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    // Carga la imagen del juego (portada)
    const img = new Image();
    img.crossOrigin = "anonymous"; // Evita problemas con CORS
    img.src = game.coverImage;

    // Cuando la imagen se carga correctamente
    img.onload = () => {
      const imgWidth = 60;
      const imgHeight = 80;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 25;

      doc.addImage(img, "JPEG", imgX, imgY, imgWidth, imgHeight);

      let y = imgY + imgHeight + 10;

      // DESCRIPCIÓN
      doc.setFontSize(12);
      doc.setFont("poppins", "bold");
      doc.text("Descripción:", 10, y);
      y += 7;

      doc.setFont("poppins", "normal");
      doc.setFontSize(11);
      const desc = doc.splitTextToSize(game.description || "Sin descripción", 180);
      doc.text(desc, 10, y);
      y += desc.length * 5 + 5;

      // GÉNERO
      doc.setFont("poppins", "bold");
      doc.text(`Género:`, 10, y);
      doc.setFont("poppins", "normal");
      doc.text(game.genre || "No especificado", 35, y);
      y += 7;

      // PLATAFORMA
      doc.setFont("poppins", "bold");
      doc.text(`Plataforma:`, 10, y);
      doc.setFont("poppins", "normal");
      doc.text(game.platform || "No especificada", 40, y);
      y += 7;

      // FECHA DE LANZAMIENTO
      doc.setFont("poppins", "bold");
      doc.text(`Fecha de lanzamiento:`, 10, y);
      doc.setFont("poppins", "normal");
      doc.text(new Date(game.releaseDate).toLocaleDateString(), 60, y);
      y += 7;

      // Guarda el PDF
      doc.save(`${game.title.replace(/[^a-z0-9]/gi, "_")}_info.pdf`);
    };

    // Si hay error al cargar la imagen
    img.onerror = () => {
      toast.error("No se pudo cargar la imagen para el PDF.");
    };
  };

  // Función para expandir o contraer comentarios largos
  const toggleExpand = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Alterna el estado de expandido / contraído
    }));
  };

  // Función para renderizar la paginación de comentarios
  const renderPagination = () => {
    const paginationItems = [];

    // Botón "Primera página" y "Anterior" si no estamos en la primera página
    if (currentCommentsPage > 1) {
      paginationItems.push(
        <Pagination.First key="first" onClick={() => setCurrentCommentsPage(1)} />,
        <Pagination.Prev key="prev" onClick={() => setCurrentCommentsPage(currentCommentsPage - 1)} />
      );
    }

    // Mostrar "1" si estamos más allá de la página 2
    if (currentCommentsPage > 2) {
      paginationItems.push(
        <Pagination.Item key={1} onClick={() => setCurrentCommentsPage(1)}>
          1
        </Pagination.Item>
      );
    }

    // Mostrar "..." si estamos más allá de la página 3
    if (currentCommentsPage > 3) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    // Página actual (marcada como activa)
    paginationItems.push(
      <Pagination.Item key={currentCommentsPage} active>
        {currentCommentsPage}
      </Pagination.Item>
    );

    // Mostrar "..." si faltan más de 2 páginas al final
    if (currentCommentsPage < totalCommentsPages - 2) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    // Mostrar última página si faltan más de 1 página
    if (currentCommentsPage < totalCommentsPages - 1) {
      paginationItems.push(
        <Pagination.Item key={totalCommentsPages} onClick={() => setCurrentCommentsPage(totalCommentsPages)}>
          {totalCommentsPages}
        </Pagination.Item>
      );
    }

    // Botón "Siguiente" y "Última página" si no estamos en la última página
    if (currentCommentsPage < totalCommentsPages) {
      paginationItems.push(
        <Pagination.Next key="next" onClick={() => setCurrentCommentsPage(currentCommentsPage + 1)} />,
        <Pagination.Last key="last" onClick={() => setCurrentCommentsPage(totalCommentsPages)} />
      );
    }

    return paginationItems;
  };

  // Si todavía no se ha cargado el juego → muestra "Cargando..."
  if (!game) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="container mt-4 game-details-page">
      <Row>
        {/* Columna principal con la información del juego */}
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Row className="g-0">
              {/* Imagen de portada */}
              <Col md={4}>
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="img-fluid rounded-start"
                />
              </Col>

              {/* Datos del juego */}
              <Col md={8}>
                <Card.Body>
                  <h2>{game.title}</h2>

                  {/* Descripción con botón de traducción */}
                  <p>
                    <strong>Descripción:</strong>{" "}
                    {showTranslation && translatedDescription
                      ? translatedDescription
                      : originalDescription}
                  </p>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      if (showTranslation) {
                        setShowTranslation(false);
                      } else {
                        fetchTranslation();
                      }
                    }}
                  >
                    {showTranslation ? "Ver original" : "Ver traducción"}
                  </Button>

                  {/* Otros datos */}
                  <p><strong>Género:</strong> {game.genre}</p>
                  <p><strong>Plataforma:</strong> {game.platform}</p>
                  <p><strong>Fecha de Lanzamiento:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>

                  {/* Botón de descarga PDF */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="ms-2"
                    onClick={handleDownloadPDF}
                  >
                    Descargar PDF
                  </Button>

                  {/* Botones para el admin (editar / eliminar juego) */}
                  {userRole?.toUpperCase() === "ADMIN" && (
                    <div className="mt-3">
                      <Button variant="warning" onClick={() => setShowEditForm(!showEditForm)}>✏️ Editar Juego</Button>
                      <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="ms-2">🗑️ Eliminar Juego</Button>
                    </div>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>

          {/* Formulario de edición de juego (solo si está activo y usuario es admin) */}
          {showEditForm && userRole.toUpperCase() === "ADMIN" && (
            <Card className="mt-3 p-3">
              <h5>Editar Información del Juego</h5>
              <Form>
                {/* Campos editables */}
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editedGame.title || ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={editedGame.description || ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Género</Form.Label>
                  <Form.Control
                    type="text"
                    name="genre"
                    value={editedGame.genre || ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Plataforma</Form.Label>
                  <Form.Control
                    type="text"
                    name="platform"
                    value={editedGame.platform || ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Fecha de Lanzamiento</Form.Label>
                  <Form.Control
                    type="date"
                    name="releaseDate"
                    value={editedGame.releaseDate ? new Date(editedGame.releaseDate).toISOString().split("T")[0] : ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>URL de Imagen</Form.Label>
                  <Form.Control
                    type="text"
                    name="coverImage"
                    value={editedGame.coverImage || ""}
                    onChange={handleEditFieldChange}
                  />
                </Form.Group>
                <Button className="mt-3" variant="primary" onClick={handleEditGame}>Guardar Cambios</Button>
              </Form>
            </Card>
          )}
        </Col>

        {/* Columna derecha con puntuación y botón para guardar en lista */}
        <Col md={4} className="d-flex flex-column align-items-center">
          <div
            className="average-rating-box text-center mb-3"
            onClick={() => setShowModalRating(true)}
            style={{ cursor: "pointer" }}
          >
            <h4>Puntuación Media</h4>
            <h2>
              <Badge bg="primary" className="p-3">{averageRating}</Badge>
            </h2>
            {userRating && (
              <p className="mt-2">
                <strong>Tu Puntuación:</strong> <Badge bg="secondary">{userRating.score}</Badge>
              </p>
            )}
            <small className="text-muted">Haz clic para puntuar</small>
          </div>

          {/* Botón para guardar en lista */}
          <Button variant="btn btn-accent" onClick={() => setShowModalList(true)}>
            Guardar en Lista
          </Button>

          {/* Enlace a la lista donde ya está guardado el juego */}
          {savedListName && userId && (
            <div className="mb-3 text-center">
              <Link to={`/user/${userId}/lists`} className="text-decoration-none">
                <span className="badge bg-info" style={{ cursor: "pointer" }}>
                  Guardado en lista: <strong>{savedListName}</strong>
                </span>
              </Link>
            </div>
          )}
        </Col>
      </Row>

      {/* Sección de comentarios */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          {/* Comentario del usuario actual */}
          {userComment ? (
            <div className="mb-4">
              <h5>Tu Comentario</h5>
              <ListGroup>
                <ListGroup.Item className="comment-item d-flex flex-column flex-md-row align-items-start gap-3">
                  {/* Avatar */}
                  <img
                    src={userComment.avatarUrl || "/default-avatar.png"}
                    alt="avatar"
                    className="comment-avatar"
                  />

                  {/* Texto del comentario */}
                  <div className="comment-body w-100">
                    <p className="comment-text mb-1">
                      {userComment.commentText.length > 200 && !expandedComments[userComment.id]
                        ? `${userComment.commentText.slice(0, 200)}...`
                        : userComment.commentText}
                      {userComment.commentText.length > 200 && (
                        <button
                          className="btn btn-link btn-sm ps-1"
                          style={{ textDecoration: "underline" }}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(userComment.id);
                          }}
                        >
                          {expandedComments[userComment.id] ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </p>

                    {/* Pie de comentario */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-2 gap-2">
                      <small className="text-muted">
                        - <Link to={`/profile/${userComment.userId}`} className="text-dark fw-bold me-2 text-decoration-none">
                          {userComment.username || "Tú"}
                        </Link>
                        | Publicado: {new Date(userComment.commentDate).toLocaleString()}
                        {userComment.updatedAt && (
                          <> | Editado: {new Date(userComment.updatedAt).toLocaleString()}</>
                        )}
                      </small>

                      {/* Botones editar / borrar */}
                      <div className="d-flex gap-2">
                        <Button variant="link" onClick={() => {
                          setEditingComment(userComment.commentText);
                          setIsEditing(true);
                        }}>
                          ✏️ Editar
                        </Button>
                        <Button variant="link" className="p-0 text-danger" onClick={handleDeleteComment}>
                          🗑️ Borrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>

              {/* Formulario de edición de comentario */}
              {isEditing && (
                <div className="mt-3">
                  {/* Error del comentario */}
                  {commentError && (
                    <Alert variant="warning" onClose={() => setCommentError("")} dismissible>
                      {commentError}
                    </Alert>
                  )}
                  <Form.Control
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                  />
                  <div className="mt-2 d-flex gap-2">
                    <Button onClick={handleEditComment}>Guardar</Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Formulario para añadir nuevo comentario
            isAuthenticated ? (
              <Form onSubmit={handleCommentSubmit} className="mb-4">
                {/* Error del comentario */}
                {commentError && (
                  <Alert variant="warning" onClose={() => setCommentError("")} dismissible>
                    {commentError}
                  </Alert>
                )}
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                />
                <Button type="submit" className="mt-2">Enviar Comentario</Button>
              </Form>
            ) : (
              <Alert variant="warning" className="mt-4">
                Debes <Link to="/login">iniciar sesión</Link> para comentar.
              </Alert>
            )
          )}

          <hr className="my-4" />

          {/* Otros comentarios */}
          <h5>Otros Comentarios</h5>
          <ListGroup className="mt-3">
            {comments.length > 0 ? (
              paginatedComments.map((comment) => (
                <ListGroup.Item
                  key={comment.id}
                  className="comment-item d-flex flex-column flex-md-row align-items-start gap-3"
                >
                  <img
                    src={comment.avatarUrl || "/default-avatar.png"}
                    alt="avatar"
                    className="comment-avatar"
                  />
                  <div className="comment-body">
                    <p className="comment-text mb-1">
                      {comment.commentText.length > 200 && !expandedComments[comment.id]
                        ? `${comment.commentText.slice(0, 200)}...`
                        : comment.commentText}
                      {comment.commentText.length > 200 && (
                        <button
                          className="btn btn-link btn-sm ps-1"
                          style={{ textDecoration: "underline" }}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(comment.id);
                          }}
                        >
                          {expandedComments[comment.id] ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </p>
                    <small className="text-muted">
                      - {comment.userId ? (
                        <Link to={`/profile/${comment.userId}`} className="text-dark fw-bold me-2 text-decoration-none">
                          {comment.username || "Usuario desconocido"}
                        </Link>
                      ) : (
                        <span className="fw-bold">{comment.username || "Usuario desconocido"}</span>
                      )}
                      | Publicado: {new Date(comment.commentDate).toLocaleString()}
                      {comment.updatedAt && (
                        <> | Editado: {new Date(comment.updatedAt).toLocaleString()}</>
                      )}
                    </small>
                  </div>

                  {/* Eliminar comentario (solo admin) */}
                  {userRole?.toUpperCase() === "ADMIN" && (
                    <Button variant="danger" size="sm" onClick={() => { setCommentIdToDelete(comment.id); setShowDeleteCommentModal(true); }}>
                      🗑️
                    </Button>
                  )}
                </ListGroup.Item>
              ))
            ) : (
              <p className="text-muted">Aún no hay comentarios.</p>
            )}
          </ListGroup>

          {/* Paginación de comentarios */}
          {totalCommentsPages > 1 && (
            <Pagination className="mt-3 justify-content-center">
              {renderPagination()}
            </Pagination>
          )}
        </Card.Body>
      </Card>

      {/* Modal de eliminar juego */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteGame}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de eliminar comentario (admin)*/}
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
          <Button variant="danger" onClick={handleDeleteCommentByAdmin}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de puntuación */}
      <Modal show={showModalRating} onHide={() => setShowModalRating(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{userRating ? "Editar Puntuación" : "Puntuar Juego"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isAuthenticated ? (
            <>
              <Form.Label>Introduce tu puntuación (1-10):</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setRating("");
                  } else {
                    const num = Number(value);
                    if (num >= 1 && num <= 10) {
                      setRating(num);
                    }
                  }
                }}
              />
              <div className="mt-3 d-flex justify-content-between">
                <Button variant="primary" onClick={handleSubmitRating}>
                  {userRating ? "Actualizar Puntuación" : "Guardar Puntuación"}
                </Button>
                {userRating && (
                  <Button variant="danger" onClick={handleDeleteRating}>
                    Eliminar Puntuación
                  </Button>
                )}
              </div>
            </>
          ) : (
            <Alert variant="warning">
              Debes iniciar sesión para puntuar. <Link to="/login">Iniciar sesión</Link>
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de guardar en lista */}
      <Modal show={showModalList} onHide={() => setShowModalList(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Guardar en Lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isAuthenticated ? (
            <>
              <Form.Select
                onChange={(e) => setSelectedList(e.target.value)}
                value={selectedList}
                className="mb-3"
              >
                <option value="">Selecciona una lista</option>
                <option value="Jugados">Jugados</option>
                <option value="Jugando">Jugando</option>
                <option value="Pendientes">Pendientes</option>
              </Form.Select>
              <div className="d-flex justify-content-end">
                <Button variant="btn btn-accent" onClick={handleAddToList} disabled={!selectedList}>
                  Guardar en lista
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="warning">
              Debes iniciar sesión para guardar este juego en una lista. <Link to="/login">Iniciar sesión</Link>
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default GameDetailsPage;