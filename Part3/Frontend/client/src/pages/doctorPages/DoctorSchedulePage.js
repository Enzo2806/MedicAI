import Navbar from '../../components/general/Navbar';
import Calendar from 'react-calendar';
import { useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useEffect } from 'react';

const DoctorSchedulePage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies();
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });

  const [day_of_the_week, setDayOfWeek] = useState('');
  const [day_start_time, setDayStartTime] = useState('');
  const [day_end_time, setDayEndTime] = useState('');
  const [lunch_start_time, setLunchStartTime] = useState('');
  const [lunch_end_time, setLunchEndTime] = useState('');


  const showError = (error) => {
    toast.error(error);
  };

  const handleSetDate = async (date) => {

    try {
      const response = await fetch(`/doctor/schedule/${(user.email)}/${(date.toISOString().split('T')[0])}`, {
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

        setDayOfWeek(data.DAY_OF_THE_WEEK)
        if (data.IS_WORKING_DAY) {
          setDayStartTime(data.DAY_START_TIME)
          setDayEndTime(data.DAY_END_TIME)
          setLunchStartTime(data.LUNCH_START_TIME)
          setLunchEndTime(data.LUNCH_END_TIME)
        }
        else {
          setDayStartTime("N/A")
          setDayEndTime("N/A")
          setLunchStartTime("N/A")
          setLunchEndTime("N/A")
        }
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
        <div>
          <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
            Day of the week: {day_of_the_week}
          </div>
          <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
            Day start time: {day_start_time}
          </div>
          <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
            Lunch start time: {lunch_start_time}
          </div>
          <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
            Lunch end time: {lunch_end_time}
          </div>
          <div className="menu-option" style={{ margin: "5px", width: "800px" }}>
            Day end time: {day_end_time}
          </div>
        </div>
        <div className="calendar-container" style={{ margin: "10px" }}>
          <Calendar
            onChange={handleSetDate}
            selectRange={false}
          />
        </div>
      </div >
    </div >
  );
};

export default DoctorSchedulePage;
