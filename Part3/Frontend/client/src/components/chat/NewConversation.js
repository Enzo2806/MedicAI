import chatstyles from '../../assets/styles/chatstyles.module.css';
import { useState, useRef, useEffect } from 'react';
import Message from './Message';

const NewConversation = ({ userEmail, showError }) => {

    const [messages, setMessages] = useState([]);
    var conversationId = '';
    const [message, setMessage] = useState('');

    // dd/mm/yyyy, hh:mm:ss
    function formatDateFromTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const bottomRef = useRef(null);
    useEffect(() => {
        if (bottomRef && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    });

    const createConversation = async () => {

        if (conversationId === '') {
            try {
                const response = await fetch(`/patient/conversation/${(userEmail)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    // If the server responds with a status other than 2xx, handle it as an error
                    const errorResponse = await response.text();
                    showError(errorResponse || 'An unexpected error occurred. Please try again.');
                    return
                }
                else {
                    conversationId = await response.text(); // Parse the JSON response
                }
            } catch (error) {
                showError(error.message || 'An unexpected error occurred. Please try again.');
                return
            }
        }

    }

    const postMessage = async (savedMessage) => {
        try {

            // Add the sent message to the frontend list of messages
            const sentMessageJson = {
                username: userEmail,
                message: savedMessage,
                isChatBotMessage: false,
                createdtime: formatDateFromTimestamp(Date.now()),
                id: messages.length + 1
            }

            const response = await fetch(`/patient/conversation/${conversationId}/${savedMessage}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                // If the server responds with a status other than 2xx, handle it as an error
                const errorResponse = await response.text();
                showError(errorResponse || 'An unexpected error occurred. Please try again.');
            }
            else {

                // Parse the response of the backend with the chatbot's reply and add it as well
                const data = await response.text();

                const replyMessageJson = {
                    username: 'Medo',
                    message: data,
                    isChatBotMessage: true,
                    createdtime: formatDateFromTimestamp(Date.now()),
                    id: messages.length + 2
                }

                setMessages([...messages, sentMessageJson, replyMessageJson]);
            }
        } catch (error) {
            showError(error.message || 'An unexpected error occurred. Please try again.');
        }
    }

    const sendMessage = async () => {

        const savedMessage = message
        setMessage('')

        if (savedMessage === '') {
            showError('Message cannot be empty')
            return
        }

        await createConversation().then(() => {
            postMessage(savedMessage);
        })
    }

    return (
        <div>
            <div>
                {
                    (messages.length > 0) ?
                        <ul className={chatstyles.messagesList}>
                            {messages.map((msg) => Message(msg))}
                            <div ref={bottomRef}></div>
                        </ul>
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><h1>No messages yet</h1></div>
                }

            </div>
            <div className={chatstyles.input}>
                <div className={chatstyles.sendForm}>
                    <input
                        placeholder='Message...'
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        style={{ width: "50%" }}
                    />
                    <button className={chatstyles.sendChatButton} onClick={sendMessage}>
                        Send Message
                    </button>
                </div>
            </div>
        </div >
    );
};

export default NewConversation;