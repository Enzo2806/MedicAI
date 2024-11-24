import React, { useState } from 'react';
import InputField from '../general/InputField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = ({ onUserAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const showError = (error) => {
    toast.error(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      // Call your backend login endpoint
      const response = await fetch(`/login/${(email)}/${(password)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the server responds with a status other than 2xx, handle it as an error
        if (response.status === 404) {
          showError('Incorrect credentials. Please try again.');
        } else {
          const errorResponse = await response.text();
          showError(errorResponse || 'An unexpected error occurred. Please try again.');
        }
      } else {
        // On successful login
        const data = await response.json(); // Parse the JSON response
        onUserAuthenticated(data); // Call the callback function with the response data
      }
    } catch (error) {
      showError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="login-form">
        <div className='login-fields'>
          <InputField
            label="Email:"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Password:"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
