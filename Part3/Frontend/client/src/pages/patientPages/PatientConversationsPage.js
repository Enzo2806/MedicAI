import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import NewConversation from '../../components/chat/NewConversation';
import { useEffect } from 'react';

const PatientConversationsPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });
  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  return (
    <div>
      <ToastContainer />
      <div>
        <Navbar />
      </div>
      <NewConversation userEmail={user.email} showError={showError} />
    </div >
  );
};

export default PatientConversationsPage;
