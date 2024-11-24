import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useEffect, useState } from 'react';
import '../../assets/styles/tablestyle.css'

const DoctorReferralsPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    // Async call
    (async () => {
      await fetchReferrals();
    })();
  }, []);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`/doctor/referrals/${user.email}`, {
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
        setReferrals(data)
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
          {referrals.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Referral Date</th>
                    <th>Referring Doctor</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>Preferred Language</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={index}>
                      <td>{referral.REFERRAL_DATE}</td>
                      <td>{referral.REFERRING_DOCTOR}</td>
                      <td>{referral.EMAIL}</td>
                      <td>{referral.FIRST_NAME}</td>
                      <td>{referral.LAST_NAME}</td>
                      <td>{referral.PREFERRED_LANGUAGE}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
              No referrals found.
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default DoctorReferralsPage;
