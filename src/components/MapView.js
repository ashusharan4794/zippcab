import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BENGALURU_CENTER, MAP_MARKERS } from '../data/mockData';
import styles from './MapView.module.css';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon factory
function makeIcon(label, bg) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${bg};border:2px solid rgba(255,255,255,0.8);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.5);
    ">
      <span style="transform:rotate(45deg);font-size:9px;font-weight:800;color:#fff;letter-spacing:.3px;">${label}</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

const pickupIcon  = makeIcon('PIN', '#22C55E');
const dropoffIcon = makeIcon('END', '#EF4444');
const carIcon     = makeIcon('CAB', '#000000');
const currentLocationIcon = makeIcon('YOU', '#3B82F6');

// Simulated driver position (midpoint that animates)
const DRIVER_POS = [13.0674, 77.5952];

function RecenterMap({ bookingStatus, currentLocation, pickupCoords, dropoffCoords }) {
  const map = useMap();

  useEffect(() => {
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(resizeTimer);
  }, [map]);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      map.fitBounds([pickupCoords, dropoffCoords], { padding: [70, 70] });
      return;
    }

    if (currentLocation) {
      map.setView(currentLocation.coords, 16);
      return;
    }

    if (bookingStatus === 'found' || bookingStatus === 'riding') {
      map.flyTo(MAP_MARKERS.pickup, 13, { duration: 1.5 });
    }
  }, [bookingStatus, currentLocation, dropoffCoords, map, pickupCoords]);
  return null;
}

export default function MapView({ bookingStatus, pickupCoords, dropoffCoords, distanceKm }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Locating...');
  const hasSelectedRoute = Boolean(pickupCoords && dropoffCoords && distanceKm);
  const estimatedTimeMin = hasSelectedRoute ? Math.max(5, Math.round(distanceKm * 2.2)) : null;
  const routeCoords = pickupCoords && dropoffCoords
    ? [pickupCoords, dropoffCoords]
    : [MAP_MARKERS.pickup, MAP_MARKERS.dropoff];

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Location unavailable');
      return undefined;
    }

    const watcherId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setCurrentLocation({
          coords: [coords.latitude, coords.longitude],
          accuracy: coords.accuracy,
        });
        setLocationStatus('Current location');
      },
      () => {
        setLocationStatus('Location permission needed');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={currentLocation?.coords || BENGALURU_CENTER}
        zoom={currentLocation ? 16 : 11}
        className={styles.map}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {currentLocation && (
          <>
            <Marker position={currentLocation.coords} icon={currentLocationIcon}>
              <Popup>
                <strong>Your exact location</strong><br />
                <span>Accuracy about {Math.round(currentLocation.accuracy)} m</span>
              </Popup>
            </Marker>
            <Circle
              center={currentLocation.coords}
              radius={currentLocation.accuracy}
              pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.12, weight: 2 }}
            />
          </>
        )}

        {/* Route line */}
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#000000', weight: 4, opacity: 0.75, dashArray: '10 6' }}
        />

        {/* Pickup marker */}
        <Marker position={pickupCoords || MAP_MARKERS.pickup} icon={pickupIcon}>
          <Popup className={styles.popup}>
            <strong>Pickup Point</strong><br />
            <span>Koramangala, Bengaluru</span>
          </Popup>
        </Marker>

        {/* Pulse circle at pickup */}
        <Circle
          center={pickupCoords || MAP_MARKERS.pickup}
          radius={400}
          pathOptions={{ color: '#22C55E', fillColor: '#22C55E', fillOpacity: 0.08, weight: 1 }}
        />

        {/* Dropoff marker */}
        <Marker position={dropoffCoords || MAP_MARKERS.dropoff} icon={dropoffIcon}>
          <Popup>
            <strong>Drop-off</strong><br />
            <span>Kempegowda Airport</span>
          </Popup>
        </Marker>

        {/* Driver marker when booked */}
        {(bookingStatus === 'found' || bookingStatus === 'riding') && (
          <Marker position={DRIVER_POS} icon={carIcon}>
            <Popup>
              <strong>Your Driver</strong><br />
              <span>Arun Kumar · KA 05 MN 4421</span>
            </Popup>
          </Marker>
        )}

        <RecenterMap
          bookingStatus={bookingStatus}
          currentLocation={currentLocation}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
        />
      </MapContainer>

      {/* Map Overlay Info */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Location</span>
          <span className={styles.infoValue}>{locationStatus}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Distance</span>
          <span className={styles.infoValue}>{distanceKm ? `${distanceKm} km` : 'Select route'}</span>
        </div>
        {estimatedTimeMin && (
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Est. Time</span>
            <span className={styles.infoValue}>~{estimatedTimeMin} min</span>
          </div>
        )}
      </div>

      {bookingStatus === 'found' && (
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          Driver en route · 2 min away
        </div>
      )}
    </div>
  );
}
