import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useState, useEffect } from 'react';


const PatientAccountInfoPage = () => {
  const [patientInfo, setPatientInfo] = useState({});

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    (async () => {
      await fetchPatientInfo(user.email);
    })();
  }, []);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  // TODO: CHANGE THE NAME OF THIS FUNCTION AND USE IT TO MAKE CALLS
  const fetchPatientInfo = async (email) => {
    try {
      const response = await fetch(`/patient/${email}`, {
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
        setPatientInfo(data);
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
          <input type="text" value={patientInfo.FIRST_NAME ? patientInfo.FIRST_NAME : "N/A"} readOnly />
          <label>Last Name</label>
          <input type="text" value={patientInfo.LAST_NAME ? patientInfo.LAST_NAME : "N/A"} readOnly />
          <label>Email:</label>
          <input type="email" value={patientInfo.EMAIL ? patientInfo.EMAIL : "N/A"} readOnly />
          <label>Password:</label>
          <input type="text" value={patientInfo.PASSWORD ? patientInfo.PASSWORD : "N/A"} readOnly />
          <label>Preferred Language:</label>
          <input type="text" value={patientInfo.PREFERRED_LANGUAGE ? patientInfo.PREFERRED_LANGUAGE : "N/A"} readOnly />
          <label>Insurance Number:</label>
          <input type="text" value={patientInfo.HEALTH_INSURANCE_NUMBER ? patientInfo.HEALTH_INSURANCE_NUMBER : "N/A"} readOnly />
          <label>Credit Card Number:</label>
          <input type="text" value={patientInfo.CREDIT_CARD_NUMBER ? patientInfo.CREDIT_CARD_NUMBER : "N/A"} readOnly />
          <label>Credit Card Expiry Date:</label>
          <input type="text" value={patientInfo.CREDIT_CARD_EXPIRY_DATE ? patientInfo.CREDIT_CARD_EXPIRY_DATE : "N/A"} readOnly />
        </div>
      </div>
    </div >
  );
};

export default PatientAccountInfoPage;
