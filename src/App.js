import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Map from './Map';
import Popup from './Popup'; // Import the Popup component

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [message, setMessage] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [allUserAttendance, setAllUserAttendance] = useState([]);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [showPopup, setShowPopup] = useState(false); // New state for showing/hiding the pop-up message
  const [popupMessage, setPopupMessage] = useState(''); // New state to hold the message for the pop-up
  const [isUserView, setIsUserView] = useState(true);

  const toggleView = () => {
    setIsUserView(!isUserView);
  };

  const handleLocationSelection = (selectedLatitude, selectedLongitude) => {
    setLatitude(selectedLatitude);
    setLongitude(selectedLongitude);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const storedUsername = localStorage.getItem('username');

    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setIsAdminLoggedIn(isAdmin);
      fetchAttendanceRecords(isAdmin);
      if (isAdmin) {
        fetchAllUserAttendance();
      }
    }
  }, []);

  const handleLogin = async (isAdminLogin) => {
    try {
      const response = await axios.post(`http://localhost:5000/${isAdminLogin ? 'admin' : 'user'}/login`, { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('isAdmin', isAdminLogin);
      setIsLoggedIn(true);
      setIsAdminLoggedIn(isAdminLogin);
      fetchAttendanceRecords(isAdminLogin);
      if (isAdminLogin) {
        fetchAllUserAttendance();
      }
    } catch (error) {
      console.log('Login error:', error);
      setMessage('Invalid username or password. Please try again.');
    }
  };

  const handleRegister = async (isAdminRegister) => {
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/${isAdminRegister ? 'admin' : 'user'}/register`, { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('isAdmin', isAdminRegister);
      setIsLoggedIn(true);
      setIsAdminLoggedIn(isAdminRegister);
      fetchAttendanceRecords(isAdminRegister);
      if (isAdminRegister) {
        fetchAllUserAttendance();
      }
    } catch (error) {
      console.log('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setUsername('');
    setIsAdminLoggedIn(false);
    setAttendanceRecords([]);
    setAllUserAttendance([]);
  };

  const handleToggleAttendance = () => {
    setShowAttendance(!showAttendance);
    if (!showAttendance && isLoggedIn) {
      fetchAttendanceRecords(isAdminLoggedIn);
    }
  };

  const handleMarkAttendance = async () => {
    if (!isLoggedIn) {
      setMessage('Please log in to mark attendance.');
      return;
    }
  
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const endpoint = isAdminLoggedIn? 'admin/mark-attendance' : 'user/mark-attendance';
  
        // Specify the location where attendance is marked
        // const attendanceLocation = { latitude: 22.5211972, longitude: 72.9162976 }; // fake
        // const attendanceLocation = { latitude: 22.5213665, longitude: 72.9166269 }; // current coordinate
        const attendanceLocation = { latitude: 23.0719488, longitude: 72.5581824 }; 
  
        // Calculate the distance between the user's location and the attendance location
        const distance = calculateDistance(latitude, longitude, attendanceLocation.latitude, attendanceLocation.longitude);
  
        // Define the threshold for marking attendance as "Present"
        const threshold = 500; // meters
  
        if (distance <= threshold) {
          // Mark attendance as "Present"
          const response = await axios.post(`http://localhost:5000/${endpoint}`, {
            username,
            latitude,
            longitude,
            status: "Present"
          });
          setShowPopup(true);
          setPopupMessage(response.data.message);
          setAttendanceStatus('Present');
          fetchAttendanceRecords(isAdminLoggedIn);
        } else {
          // Mark attendance as "Absent"
          const response = await axios.post(`http://localhost:5000/${endpoint}`, {
            username,
            latitude,
            longitude,
            status: "Absent"
          });
          setShowPopup(true);
          setPopupMessage('You are too far from the attendance location. Attendance not marked.');
          setAttendanceStatus('Absent');
          fetchAttendanceRecords(isAdminLoggedIn);
        }
      });
    } catch (error) {
      setMessage('Error marking attendance');
      console.log('Mark attendance error:', error);
    }
  };

  const handleShowAllAttendance = () => {
    setShowAllAttendance(!showAllAttendance);
  };

  const handleFetchAllUserAttendance = async () => {
    try {
      const response = await fetchAllUserAttendance();
      console.log(response);
      setAllUserAttendance(response.data.userAttendance);
    } catch (error) {
      console.error('Fetch all user attendance error:', error);
      setMessage('Error fetching all user attendance.');
    }
  };

  // const fetchAttendanceRecords = async (isAdminFetch) => {
  //   try {
  //     const endpoint = isAdminFetch ? 'admin' : 'user';
  //     const response = await axios.get(`http://localhost:5000/${endpoint}/attendance/${username}`);
  //     console.log(response);
  //     setAttendanceRecords(response.data.attendanceRecords);
  //   } catch (error) {
  //     console.log('Fetch attendance records error:', error);
  //   }
  // };
  const fetchAttendanceRecords = async (isAdminFetch) => {
    try {
      const endpoint = isAdminFetch ? 'admin' : 'user';
      const response = await axios.get(`http://localhost:5000/${endpoint}/attendance/${username}`);
      setAttendanceRecords(response.data.attendanceRecords);
    } catch (error) {
      console.error('Fetch attendance records error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setMessage('Error fetching attendance records.');
    }
  };
  

  const fetchAllUserAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/all-user-attendance');
      setAllUserAttendance(response.data.userAttendance);
    } catch (error) {
      console.error('Fetch all user attendance error:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    const meters = d * 1000;
    return meters;
  };

  return (
    <div className="App">
      <div className={`container ${isLoggedIn || isAdminLoggedIn ? 'authenticated' : ''}`}>
        {(!isLoggedIn && !isAdminLoggedIn) && (
          <div className={`auth-form ${isUserView ? 'user-view' : 'admin-view'}`}>
            <h2>{isUserView ? 'User Login' : 'Admin Login'}</h2>
            <div className="form-group">
              <label className="label">Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" />
            </div>
            <div className="form-group">
              <label className="label">Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
            </div>
            <button onClick={() => handleLogin(!isUserView)} className="button">{isUserView ? 'User Login' : 'Admin Login'}</button>
            <button onClick={() => handleRegister(!isUserView)} className="button">{isUserView ? 'User Register' : 'Admin Register'}</button>
            <button onClick={toggleView} className="button">Switch to {isUserView ? 'Admin Login' : 'User Login'}</button>
          </div>
        )}

        {(isLoggedIn || isAdminLoggedIn) && (
          <div className="authenticated-view">
            <div className="welcome-message">
              <p>Welcome, {username}!</p>
            </div>
            <div className="button-container">
              <button onClick={handleToggleAttendance} className="button">
                {showAttendance ? 'Close Attendance' : 'View Attendance'}
              </button>
              <button onClick={handleMarkAttendance} className="button">Mark Attendance</button>
              {isAdminLoggedIn && !showAllAttendance && (
                <button onClick={handleFetchAllUserAttendance} className="button">Fetch All User Attendance</button>

              )}
              {isLoggedIn && <button onClick={handleLogout} className="logout-button">Logout</button>}
            </div>
            <Map attendanceLocation={{ latitude: 22.5212085, longitude: 72.9163168 }} />
            {showAttendance && (
              <div className="attendance-details">
                {attendanceStatus && <p>You are marked as: {attendanceStatus}</p>}
                <ul>
                  {attendanceRecords.map((record, index) => (
                    <li key={index}>
                      {new Date(record.timestamp).toLocaleString()} : {record.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
        {isAdminLoggedIn &&  (
          <div className="admin-features">
            <h2>Admin Features</h2>
            <button onClick={fetchAllUserAttendance} className="button">Hide All User Attendance</button>
            <div>
              <h3>All User Attendance</h3>
              <ul>
                {allUserAttendance.map((user, index) => (
                  <div className="user-attendance" key={index}>
                    <h3>Username: {user.username}</h3>
                    <ul>
                      {user.attendanceRecords.map((record, idx) => (
                        <li key={idx}>
                          <p>Time: {new Date(record.timestamp).toLocaleString()}</p>
                          <p>Status: {record.status}</p>
                        </li>
                      ))}
                    </ul>
                    <p className="total">Total Attendance Records: <span>{user.attendanceRecords.length}</span></p>
                    <p className="total">Total Present: <span>{user.attendanceRecords.filter(record => record.status === 'Present').length}</span></p>
                    <p className="total">Total Absent: <span>{user.attendanceRecords.filter(record => record.status === 'Absent').length}</span></p>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        )}
        <p>{message}</p>
      </div>
      {/* Add the pop-up component */}
      {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
    </div>
  );
}

export default App;
