# docker/certs/generate-certs.ps1
# Generate self-signed SSL certificates (PowerShell)
$ErrorActionPreference = "Stop"
$certDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🔐 Generating self-signed SSL certificates (PowerShell)..."

# Check openssl
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Error "OpenSSL not found in PATH. Install OpenSSL or run from Git Bash/WSL."
    exit 1
}

# Subject: use POSIX-style /C=... which OpenSSL expects
$subj = "/C=IT/ST=Italy/L=Rome/O=42/OU=Pong/CN=localhost"

# Build arguments
$keyPath = Join-Path $certDir "server.key"
$crtPath = Join-Path $certDir "server.crt"
$san = "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

# Run openssl
$cmd = @(
    "req", "-x509", "-nodes", "-days", "365", "-newkey", "rsa:2048",
    "-keyout", "`"$keyPath`"", "-out", "`"$crtPath`"",
    "-subj", "`"$subj`"", "-addext", "`"$san`""
) -join " "

# Use cmd /c to preserve quoting on Windows where necessary
$process = Start-Process -FilePath "openssl" -ArgumentList $cmd -NoNewWindow -Wait -PassThru
if ($process.ExitCode -eq 0) {
    Write-Host "✅ Certificates generated successfully!"
    Write-Host "   - $crtPath"
    Write-Host "   - $keyPath"
    exit 0
} else {
    Write-Error "❌ Failed to generate certificates (exit code $($process.ExitCode))."
    exit $process.ExitCode
}
