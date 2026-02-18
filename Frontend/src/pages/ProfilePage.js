import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { Container, Row, Col, Button, Card, Alert, Image, Modal, Form, Badge } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import "./ProfilePage.css";

function ProfilePage() {
  // Contexto de autenticación
  const { user, logout } = useContext(AuthContext);

  // Navegación programática
  const navigate = useNavigate();

  // Estado: perfil del usuario mostrado
  const [profile, setProfile] = useState(null);

  // Estado: campos editables del perfil
  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // Estado: imagen de perfil
  const [profileImage, setProfileImage] = useState(null);

  // Estado: mostrar modal de editar perfil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Estado: mostrar modal de cambiar contraseña
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Estado: campos para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado: últimas puntuaciones del usuario
  const [latestRatings, setLatestRatings] = useState([]);

  // Estado: últimos comentarios del usuario
  const [latestComments, setLatestComments] = useState([]);

  // Estado: mostrar modal de confirmación de eliminación de cuenta
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Estado: número total de comentarios
  const [totalComments, setTotalComments] = useState(0);

  // Estado: número total de puntuaciones
  const [totalRatings, setTotalRatings] = useState(0);

  // Estado: comentarios expandidos o no
  const [expandedComments, setExpandedComments] = useState({});

  // Obtener el parámetro `id` de la URL
  const { id } = useParams();

  // Error en la contraseña
  const [passwordError, setPasswordError] = useState("");

  // Cargar datos cuando cambia el ID de usuario
  useEffect(() => {
    if (id) {
      fetchUserProfile(id);
      fetchLatestRatings(id);
      fetchLatestComments(id);
      fetchCommentCount(id);
      fetchRatingCount(id);
    }
  }, [id]);

  // Obtener el perfil de un usuario
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      navigate("/"); // Redirigir si hay error
    }
  };

  // Obtener las últimas puntuaciones del usuario
  const fetchLatestRatings = async (userId) => {
    try {
      const response = await axios.get(`/api/scores/user/${userId}/latest`);
      const ratings = response.data;

      if (ratings.length > 0) {
        const ratingsWithDetails = await Promise.all(
          ratings.slice(0, 3).map(async (rating) => {
            const gameResponse = await axios.get(`/api/games/${rating.gameId}`);
            return {
              ...rating,
              gameTitle: gameResponse.data.title,
              coverImage: gameResponse.data.coverImage
            };
          })
        );

        setLatestRatings(ratingsWithDetails);
      } else {
        setLatestRatings([]);
      }
    } catch (error) {
      console.error("Error al cargar las puntuaciones:", error);
    }
  };

  // Obtener los últimos comentarios del usuario
  const fetchLatestComments = async (userId) => {
    try {
      const response = await axios.get(`/api/comments/user/${userId}`);
      const comments = response.data;

      if (comments.length > 0) {
        const commentsWithDetails = await Promise.all(
          comments
            .sort((a, b) => new Date(b.commentDate) - new Date(a.commentDate)) // Ordenar por fecha
            .slice(0, 3)
            .map(async (comment) => {
              const gameResponse = await axios.get(`/api/games/${comment.gameId}`);
              return {
                ...comment,
                gameTitle: gameResponse.data.title,
                coverImage: gameResponse.data.coverImage
              };
            })
        );

        setLatestComments(commentsWithDetails);
      } else {
        setLatestComments([]);
      }
    } catch (error) {
      console.error("Error al cargar los comentarios:", error);
    }
  };

  // Contar el número total de comentarios del usuario
  const fetchCommentCount = async (userId) => {
    try {
      const response = await axios.get(`/api/comments/user/${userId}`);
      setTotalComments(response.data.length);
    } catch (error) {
      console.error("Error al contar comentarios:", error);
      setTotalComments(0);
    }
  };

  // Contar el número total de puntuaciones del usuario
  const fetchRatingCount = async (userId) => {
    try {
      const response = await axios.get(`/api/scores/user/${userId}`);
      setTotalRatings(response.data.length);
    } catch (error) {
      console.error("Error al contar puntuaciones:", error);
      setTotalRatings(0);
    }
  };

  // Manejar apertura de modal de edición de perfil
  const handleEditProfile = () => {
    if (profile) {
      setEditedUsername(profile.username || "");
      setEditedEmail(profile.email || "");
      setShowEditProfileModal(true);
    } else {
      console.error("No se ha cargado el perfil correctamente.");
    }
  };

  // Manejar cambio de imagen de perfil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  // Guardar cambios en el perfil
  const handleSaveProfile = async () => {
    try {
      const formData = {
        username: editedUsername,
        email: editedEmail,
        avatarUrl: profileImage ? profileImage : profile?.avatarUrl,
      };

      console.log("Datos enviados al backend:", formData);

      await axios.put(`/api/users/${user.userId}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Perfil actualizado correctamente.");

      // Actualizar localStorage
      localStorage.setItem("username", editedUsername);
      if (profileImage) {
        localStorage.setItem("avatarUrl", profileImage);
      }

      // Actualizar estado del perfil
      setProfile((prevProfile) => ({
        ...prevProfile,
        username: editedUsername,
        email: editedEmail,
        avatarUrl: profileImage ? profileImage : profile?.avatarUrl,
      }));

      setShowEditProfileModal(false);
      fetchUserProfile(user.userId); // Refrescar perfil
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error("Error al actualizar el perfil.");
    }
  };

  // Eliminar cuenta
  const handleDeleteProfile = async () => {
    try {
      await axios.delete(`/api/users/${profile.id}`);
      toast.success("Perfil eliminado correctamente.");

      if (user.userId === profile.id) {
        logout(); // Si es el propio usuario, cerrar sesión
      } else {
        navigate("/admin/users"); // Si es admin, volver a gestión de usuarios
      }
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      toast.error("Error al eliminar perfil.");
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await axios.put(`/api/users/${user.userId}/change-password`, {
        currentPassword,
        newPassword,
      });

      toast.success("Contraseña cambiada correctamente.");
      setShowChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(""); // limpiar error si todo ha ido bien
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error al cambiar la contraseña.");
    }
  };

  // Cambiar el rol del usuario (solo admin)
  const handleChangeUserRole = async (newRole) => {
    try {
      await axios.put(`/api/users/${profile.id}/role`, { roleName: newRole });
      toast.success("Rol actualizado correctamente.");
      setProfile((prevProfile) => ({
        ...prevProfile,
        roleName: newRole,
      }));
    } catch (error) {
      console.error("Error al cambiar el rol:", error);
      toast.error("Error al cambiar el rol del usuario.");
    }
  };

  // Expansión de comentarios
  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Verificar permisos
  const storedUserId = localStorage.getItem("userId");
  const storedUserRole = localStorage.getItem("role");

  const canEditProfile = storedUserId === profile?.id.toString();
  const canDeleteProfile = canEditProfile || storedUserRole === "admin";
  const canChangePassword = canEditProfile;

  // Render principal del componente
  return (
    <Container>
      {/* Cabecera de la página */}
      <h2>Perfil de Usuario</h2>

      {/* Foto y datos del usuario */}
      <Row className="align-items-center">
        <Col md={4}>
          {/* Foto de perfil */}
          <img
            src={profile?.avatarUrl || "/default-profile.png"} // Si no tiene avatarUrl, mostrar imagen por defecto
            alt="Foto de perfil"
            className="img-fluid rounded-circle mb-3"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </Col>

        <Col md={8}>
          {/* Nombre de usuario y correo */}
          <h3>{profile?.username || "Cargando usuario..."}</h3>
          <p className="text-muted">{profile?.email || "Cargando correo..."}</p>

          {/* Botón cambiar contraseña (solo el propio usuario) */}
          {canChangePassword && (
            <Button
              variant="warning"
              className="mt-2 mb-2"
              onClick={() => setShowChangePasswordModal(true)}
            >
              🔑 Cambiar Contraseña
            </Button>
          )}

          {/* Botones editar y eliminar */}
          <div className="d-flex mt-2">
            {canEditProfile && (
              <Button variant="primary" onClick={handleEditProfile} className="me-2">
                ✏️ Editar perfil
              </Button>
            )}

            {canDeleteProfile && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirmModal(true)}
              >
                🗑️ Eliminar perfil
              </Button>
            )}
          </div>
        </Col>

        {/* Cambiar rol (solo admin) */}
        {user?.role === "admin" && (
          <div className="mt-3">
            <Form.Group>
              <Form.Label>Cambiar Rol de Usuario</Form.Label>
              <Form.Select value={profile?.roleName || ""} onChange={(e) => handleChangeUserRole(e.target.value)}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
          </div>
        )}
      </Row>

      <hr />

      {/* Resumen de la actividad */}
      <h3>Resumen de la actividad:</h3>
      <Row className="mt-3">
        {/* Enlace a comentarios */}
        <Col md={4}>
          <Link to={`/user/${id}/comments`} style={{ textDecoration: "none" }}>
            <Badge bg="primary">Comentarios: {totalComments}</Badge>
          </Link>
        </Col>

        {/* Enlace a puntuaciones */}
        <Col md={4}>
          <Link to={`/user/${id}/ratings`} style={{ textDecoration: "none" }}>
            <Badge bg="" className="badge-score">Puntuaciones: {totalRatings}</Badge>
          </Link>
        </Col>

        {/* Enlace a listas */}
        <Col md={4}>
          <Link to={`/user/${id}/lists`} style={{ textDecoration: "none" }}>
            <Badge bg="info" style={{ cursor: "pointer" }}>
              Listas
            </Badge>
          </Link>
        </Col>
      </Row>

      <hr />

      <Row className="mt-4">
        {/* Últimos comentarios */}
        <Col md={6}>
          <h3>Últimos comentarios:</h3>
          {latestComments.length > 0 ? (
            latestComments.map((comment, index) => (
              <Link to={`/games/${comment.gameId}`} key={index} style={{ textDecoration: "none", color: "inherit" }}>
                <Card className="mb-2 p-2 shadow-sm hover-card">
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <img
                        src={comment.coverImage ? comment.coverImage : "/placeholder-image.jpg"}
                        alt={comment.gameTitle}
                        className="img-fluid rounded"
                        style={{ width: "70px", height: "100px", objectFit: "cover" }}
                      />
                    </Col>
                    <Col xs={9}>
                      <h5>{comment.gameTitle}</h5>
                      <small className="text-muted">
                        Publicado: {new Date(comment.commentDate).toLocaleDateString()}
                        {comment.updatedAt && (
                          <><br />Editado: {new Date(comment.updatedAt).toLocaleDateString()}</>
                        )}
                      </small>
                      <div className="mt-1 comment-text">
                        {/* Texto truncado con "Ver más / Ver menos" */}
                        {comment.commentText.length > 100 && !expandedComments[comment.id]
                          ? `${comment.commentText.slice(0, 50)}...`
                          : comment.commentText}

                        {comment.commentText.length > 50 && (
                          <button
                            className="btn btn-link btn-sm ps-1"
                            style={{ textDecoration: "underline" }}
                            onClick={(e) => {
                              e.preventDefault(); // Evitar que active el link
                              toggleExpand(comment.id);
                            }}
                          >
                            {expandedComments[comment.id] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Link>
            ))
          ) : (
            <p>No tienes comentarios registrados.</p>
          )}
        </Col>

        {/* Últimas puntuaciones */}
        <Col md={6}>
          <h3>Últimas puntuaciones:</h3>
          {latestRatings.length > 0 ? (
            latestRatings.map((rating, index) => (
              <Link to={`/games/${rating.gameId}`} key={index} style={{ textDecoration: "none", color: "inherit" }}>
                <Card className="mb-2 p-2 shadow-sm hover-card">
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <img
                        src={rating.coverImage ? rating.coverImage : "/placeholder-image.jpg"}
                        alt={rating.gameTitle}
                        className="img-fluid rounded"
                        style={{ width: "70px", height: "100px", objectFit: "cover" }}
                      />
                    </Col>
                    <Col xs={7}>
                      <h5>{rating.gameTitle}</h5>
                    </Col>
                    <Col xs={2} className="d-flex justify-content-center">
                      <div className="rating-box">
                        <span>{rating.score}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Link>
            ))
          ) : (
            <p>No tienes puntuaciones registradas.</p>
          )}
        </Col>
      </Row>

      {/* Modal para editar perfil */}
      <Modal show={showEditProfileModal} onHide={() => setShowEditProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>URL de Imagen de Perfil (Opcional)</Form.Label>
              <Form.Control
                type="text"
                value={profile?.avatarUrl || ""}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditProfileModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveProfile}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Error en la contraseña */}
          {passwordError && (
            <Alert variant="warning" onClose={() => setPasswordError("")} dismissible>
              {passwordError}
            </Alert>
          )}

          <Form>
            <Form.Group>
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleChangePassword}>Cambiar Contraseña</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteProfile}>Eliminar Perfil</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProfilePage;