import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icono personalizado para las tiendas
import storeIcon from "../assets/store-icon.png";

// Estilos propios
import "./StoresMapPage.css";

/* Configuración del icono por defecto de Leaflet */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* Componente principal */
const StoresMapPage = () => {

  /* Estado para la posición actual del usuario */
  const [position, setPosition] = useState(null);

  /* Estado para almacenar las tiendas cercanas */
  const [stores, setStores] = useState([]);

  /* Hook useEffect: se ejecuta al montar el componente */
  useEffect(() => {

    // Obtiene la ubicación actual del usuario
    navigator.geolocation.getCurrentPosition(
      async (pos) => {

        // Guarda la ubicación del usuario
        const userPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPosition);

        try {
          // Petición a la API de Foursquare para obtener tiendas cercanas
          const res = await fetch(
            `https://api.foursquare.com/v3/places/search?ll=${userPosition[0]},${userPosition[1]}&query=videojuegos&radius=5000&limit=10`,
            {
              headers: {
                Authorization: process.env.REACT_APP_FOURSQUARE_API_KEY,
                Accept: "application/json"
              },
            }
          );

          // Procesa los datos recibidos
          const data = await res.json();

          // Mapea los datos a un formato más sencillo
          const parsedStores = data.results.map((place) => ({
            name: place.name,
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
            address: place.location.formatted_address || "",
          }));

          // Actualiza el estado con las tiendas obtenidas
          setStores(parsedStores);

        } catch (error) {
          console.error("Error al obtener tiendas:", error);
        }
      },

      // Maneja errores en caso de no poder obtener la ubicación
      (err) => {
        console.error("Error al obtener ubicación:", err);
      }
    );
  }, []);

  /* Icono personalizado para los marcadores de tiendas */
  const customIcon = new L.Icon({
    iconUrl: storeIcon,           // URL del icono personalizado
    iconSize: [32, 32],           // Tamaño del icono
    iconAnchor: [16, 32],         // Punto del icono que apunta a la posición
  });

  /* Renderizado del componente */
  return (
    <>
      {/* Título */}
      <h2 className="map-title text-center">Visita tus tiendas cercanas de videojuegos</h2>

      {/* Si no se ha obtenido la posición aún, muestra mensaje */}
      {!position ? (
        <p className="text-center mt-4">Obteniendo tu ubicación...</p>
      ) : (
        /* Si se ha obtenido la posición, muestra el mapa */
        <div className="map-wrapper">
          <div className="map-container">
            <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
              {/* Capa base del mapa (OpenStreetMap) */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />

              {/* Marcador para la ubicación del usuario */}
              <Marker position={position}>
                <Popup>Tu ubicación</Popup>
              </Marker>

              {/* Marcadores de las tiendas obtenidas */}
              {stores.map((store, index) => (
                <Marker key={index} position={[store.lat, store.lng]} icon={customIcon}>
                  <Popup>
                    {/* Enlace a Google Maps para esa tienda */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name} ${store.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}
                    >
                      {store.name}
                    </a>

                    {/* Dirección de la tienda */}
                    <div style={{ fontSize: "0.85rem", marginTop: "4px", color: "#555" }}>
                      {store.address}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default StoresMapPage;