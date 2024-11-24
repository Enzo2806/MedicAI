// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext'; // For user context

import LoginPage from './pages/LoginPage'; // Login

// Menus
import DoctorMenuPage from './pages/DoctorMenuPage'; 
import PatientMenuPage from './pages/PatientMenuPage'; 

// Patient pages
import PatientAccountInfoPage from './pages/patientPages/PatientAccountInfoPage'; 
import PatientAppointmentsPage from './pages/patientPages/PatientAppointmentsPage';
import PatientMonthlyRecordsPage from './pages/patientPages/PatientReceiptsPage';
import PatientConversationPage from './pages/patientPages/PatientConversationsPage';
import PatientFavoriteDoctorsPage from './pages/patientPages/PatientFavoriteDoctorsPage';

// Doctor pages
import DoctorAccountInfoPage from './pages/doctorPages/DoctorAccountInfoPage'; 
import DoctorAppointmentsPage from './pages/doctorPages/DoctorAppointmentsPage';
import DoctorReferralsPage from './pages/doctorPages/DoctorReferralsPage';
import DoctorTopPlayersPage from './pages/doctorPages/DoctorTopPlayersPage';
import DoctorSchedulePage from './pages/doctorPages/DoctorSchedulePage';

// Converstaion page
import ViewConversation from './components/chat/ViewConversation'

import './assets/styles/styles.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/patient-menu" element={<PatientMenuPage />} />
          <Route path="/doctor-menu" element={<DoctorMenuPage />} />

          <Route path="/patient-account-info" element={<PatientAccountInfoPage />} />
          <Route path="/patient-appointments" element={<PatientAppointmentsPage />} />
          <Route path="/patient-monthly-receipts" element={<PatientMonthlyRecordsPage />} />
          <Route path="/patient-start-conversation" element={<PatientConversationPage />} />
          <Route path="/patient-favorite-doctors" element={<PatientFavoriteDoctorsPage />} />

          <Route path="/doctor-account-info" element={<DoctorAccountInfoPage />} />
          <Route path="/doctor-appointments" element={<DoctorAppointmentsPage />} />
          <Route path="/doctor-referrals" element={<DoctorReferralsPage />} />
          <Route path="/doctor-top-players" element={<DoctorTopPlayersPage />} />
          <Route path="/doctor-schedule" element={<DoctorSchedulePage />} />

          <Route path="/conversation/view" element={<ViewConversation/>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;