import Navbar from '../../components/general/Navbar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/menuPage.css';
import '../../assets/styles/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import React from 'react';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import '../../assets/styles/tablestyle.css';


const PatientReceiptsPage = () => {

  const navigate = useNavigate();
  const cookies = new Cookies({ path: '/' });
  const user = cookies.get('user');
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });
  const [receipts, setReceipts] = useState([]);

  // Call this function to show an error to the user
  const showError = (error) => {
    toast.error(error);
  };

  // TODO: CHANGE THE NAME OF THIS FUNCTION AND USE IT TO MAKE CALLS
  const retrieveReceipts = async (date) => {

    // Extract the month and year from the date
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    try {
      const response = await fetch(`/patient/receipts/${user.email}/${year}/${month}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the server responds with a status other than 2xx, handle it as an error
        const errorResponse = await response.text();
        showError(errorResponse || 'An unexpected error occurred. Please try again.');
        setReceipts([]);
      }
      else {
        // On successful login
        const data = await response.json(); // Parse the JSON response

        // Store the returned list
        setReceipts(data);
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
            onChange={retrieveReceipts}
            selectRange={false}
            maxDetail="year"
          />
        </div>
        {receipts.length !== 0 ?
          <div style={{
            display: "flex",
            alignItems: "center"
          }}>
            <table>
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Date</th>
                  <th>Service cost</th>
                  <th>Tax</th>
                  <th>Insurance payout</th>
                  <th>Cancellation fee</th>
                  <th>Total cost</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt, index) => {
                  return (
                    <tr key={index}>
                      <td> {receipt.RECEIPT_ID != null ? receipt.RECEIPT_ID : "N/A"}</td>
                      <td> {receipt.DATE != null ? receipt.DATE : "N/A"}</td>
                      <td> {receipt.SERVICE_COST != null ? receipt.SERVICE_COST : "N/A"}</td>
                      <td> {receipt.TAX_AMOUNT != null ? receipt.TAX_AMOUNT : "N/A"}</td>
                      <td> {receipt.INSURANCE_PAYOUT != null ? receipt.INSURANCE_PAYOUT : "N/A"}</td>
                      <td> {receipt.CANCELLATION_FEE != null ? receipt.CANCELLATION_FEE : "N/A"}</td>
                      <td> {receipt.FINAL_COST != null ? receipt.FINAL_COST : "N/A"}</td>
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

export default PatientReceiptsPage;
