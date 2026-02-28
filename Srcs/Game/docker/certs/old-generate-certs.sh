#!/bin/bash
# ===========================================
# Generate self-signed SSL certificates for development
# ===========================================
# Usage: ./generate-certs.sh
#
# This creates certificates valid for:
# - localhost
# - 127.0.0.1
# - 0.0.0.0 (all interfaces)

CERT_DIR="$(dirname "$0")"

echo "🔐 Generating self-signed SSL certificates..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=IT/ST=Italy/L=Rome/O=42/OU=Pong/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

if [ $? -eq 0 ]; then
  echo "✅ Certificates generated successfully!"
  echo "   - $CERT_DIR/server.crt"
  echo "   - $CERT_DIR/server.key"
  echo ""
  echo "⚠️  These are self-signed certificates for DEVELOPMENT only."
  echo "   Browsers will show a security warning - click 'Advanced' and proceed."
  echo ""
  echo "   The certificates work for localhost and any LAN IP you use."
  echo "   For production, use Let's Encrypt or a real CA certificate."
else
  echo "❌ Failed to generate certificates"
  exit 1
fi
