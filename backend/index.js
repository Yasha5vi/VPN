import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import net from 'net';
import cors from 'cors';

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 2000;
const KEY = Buffer.from('2e6c7f292306cd6518aff5ff99dba46e', 'hex');

const app = express();
app.use(bodyParser.json());
app.use(cors());

function encrypt(message, key) {
    const iv = Buffer.alloc(16).fill(0);
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key,'hex'), iv);
    let encryptedMessage = cipher.update(message,'utf-8','hex');
    encryptedMessage += cipher.final('hex');
    console.log("index encrypt : "+encryptedMessage);
    return encryptedMessage;
}


// this function is currently not working and is the only thing
// left to be fixed
function decrypt(ciphertext, key) {
    const iv = Buffer.alloc(16).fill(0);
    const decipher = crypto.createDecipheriv('aes-128-cbc',Buffer.from(key,'hex'),iv);
    let decryptedMessage = decipher.update(ciphertext,'hex','utf-8');
    decryptedMessage += decipher.final('utf-8');
    console.log("index decrypt : "+decryptedMessage);
    return decryptedMessage;
}


app.post('/send-message', (req, res) => {
    const { message } = req.body;
    const encryptedMessage = encrypt(message, KEY);

    const client = new net.Socket();
    client.connect(SERVER_PORT, SERVER_HOST, () => {
        client.write(encryptedMessage);
    });

    client.on('data', (data) => {
        const decryptedResponse = decrypt(data.toString(), KEY);
        res.status(200).json({ response: decryptedResponse });
        client.destroy();
    });

    client.on('error', (err) => {
        console.error('Client error:', err.message);
        res.status(500).json({ error: 'Failed to send message' });
    });
});

// Updated /start-vpn endpoint
app.post('/start-vpn', (req, res) => {
    res.status(200).json({ message: 'Please start the VPN server manually' });
});

// Updated /stop-vpn endpoint
app.post('/stop-vpn', (req, res) => {
    res.status(200).json({ message: 'Please stop the VPN server manually' });
});

// Updated /vpn-status endpoint
app.get('/vpn-status', (req, res) => {
    // This is a placeholder. Adjust as needed to reflect manual VPN status check.
    res.status(200).json({ status: 'VPN status checking is disabled. Please check manually.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
