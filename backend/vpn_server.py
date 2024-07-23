import socket
import threading
from Crypto.Cipher import AES
import base64

# Configuration
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 2000
KEY = bytes.fromhex('2e6c7f292306cd6518aff5ff99dba46e')  # Ensure this key is exactly 16 bytes

# Check key length
if len(KEY) != 16:
    raise ValueError("Key must be exactly 16 bytes long.")

def pad(data):
    pad_len = AES.block_size - (len(data) % AES.block_size)
    return data + bytes([pad_len]) * pad_len

def unpad(data):
    pad_len = data[-1]
    return data[:-pad_len]

def encrypt(message, key):
    message = pad(message)
    iv = bytes([0] * AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = cipher.encrypt(message)
    return encrypted.hex()

def decrypt(ciphertext, key):
    ciphertext = bytes.fromhex(ciphertext)
    iv = bytes([0] * AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = cipher.decrypt(ciphertext)
    return unpad(plaintext)

def handle_client(client_socket):
    while True:
        try:
            encrypted_data = client_socket.recv(1024)
            if not encrypted_data:
                break
            print(f"Encrypted data received: {encrypted_data}")
            decrypted_data = decrypt(encrypted_data.decode(), KEY)
            print(f"Decrypted data: {decrypted_data.decode()}")

            # Echo back the encrypted data received from the client
            encrypted_response = encrypt(decrypted_data, KEY)
            print(f"Encrypted response: {encrypted_response}")
            client_socket.send(encrypted_response.encode())
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
