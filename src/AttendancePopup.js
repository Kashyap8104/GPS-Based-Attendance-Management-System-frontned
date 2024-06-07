// AttendancePopup.js

import React from 'react';
import './AttendancePopup.css';

const AttendancePopup = ({ attendanceRecords, onClose }) => {
  return (
    <div className="attendance-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>Close</button>
        <h2>Attendance Records</h2>
        <ul>
          {attendanceRecords.map((record, index) => (
            <li key={index}>
              {record.timestamp}: {record.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttendancePopup;
