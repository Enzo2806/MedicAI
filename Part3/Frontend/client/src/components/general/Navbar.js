// Navbar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoImage from '../../assets/images/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname.includes('/login')) {
      navigate('/login');
    } else if (location.pathname.includes('/patient')) {
      navigate('/patient-menu');
    } else if (location.pathname.includes('/doctor')) {
      navigate('/doctor-menu');
    } else {
      navigate('/'); // Default navigation if the user status is unknown
    }
  };

  return (
    <nav className="navbar" onClick={handleLogoClick}>
        <div>
            <img src={LogoImage} alt="MedicAI" style={{ width: '60px', cursor: 'pointer' }}/>
        </div>
        <div className="navbar-text" style={{ cursor: 'pointer' }}>MedicAI</div>
    </nav>
  );
};

export default Navbar;