import { React, useEffect } from 'react';
import Navbar from '../components/general/Navbar';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/menuPage.css'; // You can reuse the same stylesheet if it's generic enough
import Cookies from 'universal-cookie';


const DoctorMenuPage = () => {
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
      <div className="patient-menu"> {/* If this class is not styled specifically for patients, consider renaming it to a more general class name like "menu" */}
        <div className="menu-option" onClick={() => navigate('/doctor-account-info')}>
          View account info
        </div>
        <div className="menu-option" onClick={() => navigate('/doctor-appointments')}>
          Retrieve appointments
        </div>
        <div className="menu-option" onClick={() => navigate('/doctor-referrals')}>
          View referrals
        </div>
        <div className="menu-option" onClick={() => navigate('/doctor-top-players')}>
          Find top performers for the month
        </div>
        <div className="menu-option" onClick={() => navigate('/doctor-schedule')}>
          View daily schedule
        </div>
        <div className="menu-option quit" onClick={() => { cookies.remove('user'); navigate('/quit'); }}>
          Quit
        </div>
      </div>
    </div >
  );
};

export default DoctorMenuPage;
