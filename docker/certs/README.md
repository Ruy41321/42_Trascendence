# SSL Certificates Directory

This folder contains SSL certificates for HTTPS.

## Development (self-signed)

Generate self-signed certificates:
```bash
cd docker/certs
chmod +x generate-certs.sh
./generate-certs.sh
```

This creates:
- `server.crt` - Certificate
- `server.key` - Private key

⚠️ **Browser Warning**: Self-signed certs trigger security warnings.
Click "Advanced" → "Proceed" to continue.

## Production

For production, replace with real certificates:
- Use [Let's Encrypt](https://letsencrypt.org/) (free)
- Or purchase from a CA

Place your certificates here:
- `server.crt` (or `fullchain.pem`)
- `server.key` (or `privkey.pem`)

## Files in this folder

```
certs/
├── generate-certs.sh   # Script to generate dev certs
├── server.crt          # Certificate (gitignored)
├── server.key          # Private key (gitignored)
└── README.md
```
