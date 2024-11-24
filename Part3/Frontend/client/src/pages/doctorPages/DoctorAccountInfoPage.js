import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useState, useEffect } from 'react';

const DoctorAccountInfoPage = () => {
  const [doctorInfo, setDoctorInfo] = useState({});

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    // Async call
    (async () => {
      await fetchDoctorInfo(user.email);
    })();
  }, []);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  // TODO: CHANGE THE NAME OF THIS FUNCTION AND USE IT TO MAKE CALLS
  const fetchDoctorInfo = async (email) => {
    try {
      const response = await fetch(`/doctor/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the server responds with a status other than 2xx, handle it as an error
        const errorResponse = await response.text();
        showError(errorResponse || 'An unexpected error occurred. Please try again.');
      }
      else {
        // On successful login
        const data = await response.json(); // Parse the JSON response
        setDoctorInfo(data);
      }
    } catch (error) {
      showError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <ToastContainer />
      <div>
        <Navbar />
      </div>
      <div className="menu-page">
        <h2>View Info</h2>
        <div className="info-form">
          <label>First Name:</label>
          <input type="text" value={doctorInfo.FIRST_NAME ? doctorInfo.FIRST_NAME : "N/A"} readOnly />
          <label>Last Name:</label>
          <input type="text" value={doctorInfo.LAST_NAME ? doctorInfo.LAST_NAME : "N/A"} readOnly />
          <label>Email:</label>
          <input type="email" value={doctorInfo.EMAIL ? doctorInfo.EMAIL : "N/A"} readOnly />
          <label>Password:</label>
          <input type="text" value={doctorInfo.PASSWORD ? doctorInfo.PASSWORD : "N/A"} readOnly />
          <label>Preferred Language:</label>
          <input type="text" value={doctorInfo.PREFERRED_LANGUAGE ? doctorInfo.PREFERRED_LANGUAGE : "N/A"} readOnly />
          <label>Specialization:</label>
          <input type="text" value={doctorInfo.SPECIALIZATION ? doctorInfo.SPECIALIZATION : "N/A"} readOnly />
          <label>Price per Hour:</label>
          <input type="text" value={doctorInfo.PRICE_PER_HOUR ? doctorInfo.PRICE_PER_HOUR : "N/A"} readOnly />
        </div>
      </div>
    </div >
  );
};

export default DoctorAccountInfoPage;
