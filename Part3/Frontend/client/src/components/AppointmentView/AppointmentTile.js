import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../assets/styles/appointment.css"
const AppointmentTile = ({ appointment, userEmail }) => {
  const navigate = useNavigate();

  const goToViewConversation = () => {
    // Navigate to the ViewConversation component with state
    navigate(`/conversation/view`, {
      state: {
        appointmentId: appointment.APPOINTMENT_ID,
        userEmail: userEmail
      }
    });
  };

  const formattedDate = new Date(appointment.DATE).toLocaleDateString();

  return (
    // Highlight in red if cancelled
    <div className="appointment-tile" style={{ backgroundColor: appointment.IS_CANCELLED ? '#ffcccc' : '#fff' }}>
      <div className="appointment-info">
        <div><strong>Date:</strong> {formattedDate}</div>
        <div><strong>From:</strong> {appointment.START_TIME}</div>
        <div><strong>To:</strong> {appointment.END_TIME}</div>
        <div className="appointment-link"><a href={appointment.MEETING_LINK}>Join Meeting</a></div>
      </div>
      <button className="AppointmentButton" onClick={goToViewConversation}>View Details</button>
    </div>
  );
};

export default AppointmentTile;
