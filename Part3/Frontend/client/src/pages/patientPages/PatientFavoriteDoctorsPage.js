import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useEffect, useState } from 'react';

const PatientFavoriteDoctorsPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    // Async call
    (async () => {
      await fetchFavoriteDoctors();
    })();
  }, []);
  const [favoriteDoctors, setFavoriteDoctors] = useState([]);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  const fetchFavoriteDoctors = async () => {
    try {
      const response = await fetch(`/patient/favoritedoctors/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        showError(errorResponse || 'An unexpected error occurred. Please try again.');
      } else {
        const data = await response.json();
        setFavoriteDoctors(data);
      }
    } catch (error) {
      showError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <div className="rowC" style={{ maxWidth: "fit-content", marginLeft: "auto", marginRight: "auto", marginTop: "10%" }}>
        <div>
          {favoriteDoctors.length > 0 ? (
            favoriteDoctors.map((doctor, index) => (
              <div key={index} className="menu-option" style={{ margin: "5px", width: "800px" }}>
                <div>{doctor.DOCTOR_EMAIL}</div>

              </div>
            ))
          ) : (
            <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
              {favoriteDoctors.length === 0 ? "No favorite doctors found." : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientFavoriteDoctorsPage;