import socket
import threading
from Crypto.Cipher import AES
import base64
import os

# Configuration
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 2000
KEY = bytes.fromhex('b91f133b503011efcd08a195f6ce7dc86f3e40e5c6d04e9c6e8fb765d38209a5')  # Ensure this key is exactly 32 bytes

# Check key length
if len(KEY) != 32:
    raise ValueError("Key must be exactly 32 bytes long.")

def pad(data):
    return data + b"\0" * (AES.block_size - len(data) % AES.block_size)

def encrypt(message, key):
    message = pad(message)
    iv = os.urandom(AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = iv + cipher.encrypt(message)
    return base64.b64encode(encrypted)

def decrypt(ciphertext, key):
    ciphertext = base64.b64decode(ciphertext)
    iv = ciphertext[:AES.block_size]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = cipher.decrypt(ciphertext[AES.block_size:])
    return plaintext.rstrip(b"\0")

def handle_client(client_socket):
    while True:
        try:
            encrypted_data = client_socket.recv(1024)
            if not encrypted_data:
                break
            print(f"Encrypted data received: {encrypted_data}")
            decrypted_data = decrypt(encrypted_data, KEY)
            print(f"Decrypted data: {decrypted_data}")

            # Echo back the encrypted data received from the client
            encrypted_response = encrypt(decrypted_data, KEY)
            print(f"Encrypted response: {encrypted_response}")
            client_socket.send(encrypted_response)
        except Exception as e:
            print(f"Error: {e}")
            break
    client_socket.close()

def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((SERVER_HOST, SERVER_PORT))
    server.listen(5)
    print(f"Listening on {SERVER_HOST}:{SERVER_PORT}")
    
    while True:
        client_socket, addr = server.accept()
        print(f"Accepted connection from {addr}")
        client_handler = threading.Thread(target=handle_client, args=(client_socket,))
        client_handler.start()

if __name__ == "__main__":
    start_server()
