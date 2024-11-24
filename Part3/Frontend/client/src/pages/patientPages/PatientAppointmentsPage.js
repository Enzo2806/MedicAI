import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useState, useEffect } from 'react';
import AppointmentTile from '../../components/AppointmentView/AppointmentTile';

const PatientAccountInfoPage = () => {
  const [appointments, setAppointments] = useState([]);

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    (async () => {
      await fetchAppointments(user.email);
    })();
  }, []);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  const fetchAppointments = async (email) => {
    try {
      const response = await fetch(`/patient/appointments/${email}`, {
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
        setAppointments(data);
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
      <div className="appointments-container">
        <h1>View Appointments</h1>
        {appointments.map((appointment) => (
          <AppointmentTile key={appointment.APPOINTMENT_ID} appointment={appointment} userEmail={user.email} />
        ))}
      </div>
    </div >
  );
};

export default PatientAccountInfoPage;
