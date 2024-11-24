import Navbar from '../../components/general/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import '../../assets/styles/tablestyle.css';
import 'react-calendar/dist/Calendar.css';

const DoctorTopPerformersPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });
  const [topPerformers, setTopPerformers] = useState([]);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  // TODO: CHANGE THE NAME OF THIS FUNCTION AND USE IT TO MAKE CALLS
  const retrieveTopPerformers = async (date) => {

    // Extract the month and year from the date
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    try {
      const response = await fetch(`/doctor/top/${month}/${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the server responds with a status other than 2xx, handle it as an error
        const errorResponse = await response.text();
        showError(errorResponse || 'An unexpected error occurred. Please try again.');
        setTopPerformers([]);
      }
      else {
        // On successful login
        const data = await response.json(); // Parse the JSON response

        console.log(data)
        // Store the returned list
        setTopPerformers(data);
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
      <div className="rowC" style={{ maxWidth: "fit-content", marginLeft: "auto", marginRight: "auto", marginTop: "10%" }}>
        <div className="calendar-container" style={{ margin: "10px" }}>
          <Calendar
            onChange={retrieveTopPerformers}
            selectRange={false}
            maxDetail="year"
          />
        </div>
        {topPerformers.length !== 0 ?
          <div style={{
            display: "flex",
            alignItems: "center"
          }}>
            <table>
              <thead>
                <tr>
                  <th>Doctor email</th>
                  <th>Number of appointments</th>
                  <th>Number of favorites received</th>
                  <th>Number of references received</th>
                  <th>Specialization</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((receipt, index) => {
                  return (
                    <tr key={index}>
                      <td> {receipt.DOCTOR_EMAIL != null ? receipt.DOCTOR_EMAIL : "N/A"}</td>
                      <td> {receipt.NUM_APPOINTMENTS_FOR_MONTH != null ? receipt.NUM_APPOINTMENTS_FOR_MONTH : "N/A"}</td>
                      <td> {receipt.NUM_FAVORITES != null ? receipt.NUM_FAVORITES : "N/A"}</td>
                      <td> {receipt.NUM_REFS != null ? receipt.NUM_REFS : "N/A"}</td>
                      <td> {receipt.SPECIALIZATION != null ? receipt.SPECIALIZATION : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          :
          <div>
            {/* Empty div if no receipts are found */}
          </div>
        }
      </div >
    </div >
  );
};

export default DoctorTopPerformersPage;
