import { React, useEffect } from 'react';
import Navbar from '../components/general/Navbar';

import { useNavigate } from 'react-router-dom';
import '../assets/styles/menuPage.css';
import Cookies from 'universal-cookie';

const PatientMenuPage = () => {
  const navigate = useNavigate();

  const cookies = new Cookies();
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });

  return (
    <div>
      <Navbar />
      <div className="patient-menu">
        <div className="menu-option" onClick={() => navigate('/patient-account-info')}>
          View account info
        </div>
        <div className="menu-option" onClick={() => navigate('/patient-appointments')}>
          View appointments
        </div>
        <div className="menu-option" onClick={() => navigate('/patient-monthly-receipts')}>
          View monthly receipts
        </div>
        <div className="menu-option" onClick={() => navigate('/patient-start-conversation')}>
          Start a conversation
        </div>
        <div className="menu-option" onClick={() => navigate('/patient-favorite-doctors')}>
          See your favorite doctors
        </div>
        <div className="menu-option quit" onClick={() => { cookies.remove('user'); navigate('/quit') }}>
          Quit
        </div>
      </div>
    </div>

  );
};

export default PatientMenuPage;
