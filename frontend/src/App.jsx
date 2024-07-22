import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');

    const sendMessage = async () => {
        try {
            const response = await axios.post('http://localhost:3000/send-message', { message });
            setResponse(response.data.response);
        } catch (error) {
            console.log(error);
            setResponse('Error sending message');
        }
    };

    return (
        <div>
            <h1>VPN Management</h1>
            <h2>Send Message</h2>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
            />
            <button onClick={sendMessage}>Send</button>
            <pre>{response}</pre>
        </div>
    );
};

export default App;
