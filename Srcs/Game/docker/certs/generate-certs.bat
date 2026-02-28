@echo off
REM docker\certs\generate-certs.bat
REM Generate self-signed SSL certificates (Batch)

SETLOCAL ENABLEDELAYEDEXPANSION
SET "SCRIPT_DIR=%~dp0"
SET "KEY=%SCRIPT_DIR%server.key"
SET "CRT=%SCRIPT_DIR%server.crt"

echo 🔐 Generating self-signed SSL certificates (Batch)...

where openssl >nul 2>&1
IF ERRORLEVEL 1 (
  echo OpenSSL not found in PATH. Install OpenSSL or run from Git Bash/WSL.
  exit /b 1
)

REM Use POSIX-style subject for OpenSSL
SET "SUBJ=/C=IT/ST=Italy/L=Rome/O=42/OU=Pong/CN=localhost"
SET "SAN=subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "%KEY%" -out "%CRT%" -subj "%SUBJ%" -addext "%SAN%"
IF %ERRORLEVEL% EQU 0 (
  echo ✅ Certificates generated successfully!
  echo    - %CRT%
  echo    - %KEY%
  exit /b 0
) ELSE (
  echo ❌ Failed to generate certificates.
  exit /b %ERRORLEVEL%
)
