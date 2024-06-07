import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ attendanceLocation }) => {
  useEffect(() => {
    // Create a map centered at the attendance location
    const map = L.map('map').setView([attendanceLocation.latitude, attendanceLocation.longitude], 13);

    // Add a tile layer (e.g., OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a marker at the attendance location
    const marker = L.marker([attendanceLocation.latitude, attendanceLocation.longitude]).addTo(map);

    // Add a circle representing the 100-meter range
    const circle = L.circle([attendanceLocation.latitude, attendanceLocation.longitude], {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.3,
      radius: 100,
    }).addTo(map);
    
    // Cleanup function to remove the map when the component unmounts
    return () => {
      map.remove();
    };
  }, [attendanceLocation]);

  return <div id="map" style={{ height: '400px' }}></div>;
};

export default Map;
