#!/bin/bash
# ===========================================
# Generate self-signed SSL certificates for development
# ===========================================

CERT_DIR="$(dirname "$0")"

# --- OS DETECTION ---
# Git Bash/MinGW on Windows reports as 'msys' or 'cygwin'
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "WINDOWS environment detected. Applying path conversion fix..."
    SUBJ="//C=IT/ST=Italy/L=Rome/O=42/OU=Pong/CN=localhost"
else
    echo "🐧 Unix-like environment detected."
    SUBJ="/C=IT/ST=Italy/L=Rome/O=42/OU=Pong/CN=localhost"
fi

echo "🔐 Generating self-signed SSL certificates..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "$SUBJ" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

if [ $? -eq 0 ]; then
  echo "✅ Certificates generated successfully!"
  echo "   - $CERT_DIR/server.crt"
  echo "   - $CERT_DIR/server.key"
else
  echo "❌ Failed to generate certificates"
  exit 1
fi
