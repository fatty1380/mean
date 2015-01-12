#!/bin/bash
echo "Generating self-signed certificates..."
OPENSSL genrsa -out ./config/sslcerts/key.pem -aes256 1024
OPENSSL req -new -key ./config/sslcerts/key.pem -out ./config/sslcerts/csr.pem
OPENSSL x509 -req -days 9999 -in ./config/sslcerts/csr.pem -signkey ./config/sslcerts/key.pem -out ./config/sslcerts/cert.pem
rm ./config/sslcerts/csr.pem
chmod 600 ./config/sslcerts/key.pem ./config/sslcerts/cert.pem
