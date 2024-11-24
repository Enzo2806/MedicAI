import { React, useEffect } from 'react';
import Navbar from '../components/general/Navbar';
import LoginForm from '../components/login/LoginForm';
import '../assets/styles/login.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });

  const redirect = (userData) => {
    if (userData.type === 'doctor') {
      navigate('/doctor-menu');
    } else if (userData.type === 'patient') {
      navigate('/patient-menu');
    } else {
      showError('Unknown user type:', userData.type);
    }
  }

  const showError = (error) => {
    toast.error(error);
  };

  const user = cookies.get('user');
  useEffect(() => {
    if (user) {
      redirect(user);
    }
  });

  const onUserAuthenticated = (userData) => {

    cookies.set('user', userData, { path: '/' });
    redirect(userData);
  };

  return (
    <div>
      <ToastContainer />
      <div className="login-page">
        <Navbar />
        <div className="login-container">
          <LoginForm onUserAuthenticated={onUserAuthenticated} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
