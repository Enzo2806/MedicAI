import chatstyles from '../../assets/styles/chatstyles.module.css';
import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../general/Navbar';

const ViewConversation = () => {
    const location = useLocation();
    const state = location.state || {};
    const { userEmail, appointmentId } = state; // Extract userEmail and appointmentId from state

    const [messages, setMessages] = useState([]);

    // Call this function to show an error to the user
    const showError = (error) => {
        toast.error(error);
    };

    // dd/mm/yyyy, hh:mm:ss
    function formatDateFromTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }


    useEffect(() => {
        if (bottomRef && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        (async () => {
            setMessages([]);
            await retrieveMessages();
        })();
    }, []);

    const bottomRef = useRef(null);

    const retrieveMessages = async () => {

        try {
            const response = await fetch(`/appointment/conversation/${(appointmentId)}`, {
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
                const conversation = await response.json(); // Parse the JSON response

                var messageList = []
                for (var i = 0; i < conversation.length; i++) {
                    var message = {
                        username: (conversation[i].IS_SENT_BY_CHATBOT ? "Medo" : userEmail),
                        message: conversation[i].MESSAGE_CONTENT,
                        isChatBotMessage: conversation[i].IS_SENT_BY_CHATBOT,
                        createdtime: formatDateFromTimestamp(new Date(conversation[i].SENDING_TIME)),
                        id: i + 1
                    }
                    messageList.push(message);
                }
                setMessages(messageList);
            }
        } catch (error) {
            showError(error.message || 'An unexpected error occurred. Please try again.');
            return
        }

    }

    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div>
                <ToastContainer />
                {
                    (messages.length > 0) ?
                        <ul className={chatstyles.messagesList}>
                            {messages.map((msg) => Message(msg))}
                            <div ref={bottomRef}></div>
                        </ul>
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><h1>No messages in this conversation</h1></div>
                }
            </div >
        </div>
    );
};

export default ViewConversation;