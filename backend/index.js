import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import net from 'net';
import cors from 'cors';

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 2000;
const KEY = Buffer.from('b91f133b503011efcd08a195f6ce7dc86f3e40e5c6d04e9c6e8fb765d38209a5', 'hex');

const app = express();
app.use(bodyParser.json());
app.use(cors());

function pad(data) {
    const blockSize = 16;
    const padding = blockSize - (data.length % blockSize);
    return Buffer.concat([data, Buffer.alloc(padding, 0)]);
}

function encrypt(message, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(pad(Buffer.from(message))), cipher.final()]);
    return encrypted.toString('base64');
}


// this function is currently not working and is the only thing
// left to be fixed
function decrypt(ciphertext, key) {
    // Convert base64-encoded ciphertext to buffer
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');

    // Define the size of the IV (AES block size is 16 bytes)
    const IV_SIZE = 16;

    if (ciphertextBuffer.length <= IV_SIZE) {
        throw new Error('Ciphertext is too short.');
    }

    // Extract IV and encrypted text
    const iv = ciphertextBuffer.slice(0, IV_SIZE);
    const encryptedText = ciphertextBuffer.slice(IV_SIZE);

    // Create decipher instance with key and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // Decrypt the encrypted text
    let decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final()
    ]);

    // Remove padding (null bytes)
    decrypted = decrypted.toString('utf8').replace(/\0+$/, '');

    return decrypted;
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
