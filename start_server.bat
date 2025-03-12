@echo off
cd /d C:\Users\Administrator\software_Lallave

echo Instalando dependencias...
call npm install

echo Compilando TypeScript...
call npx tsc

echo Verificando si la carpeta de salida existe...
if not exist "dist" (
    echo ERROR: No se generó la carpeta dist. Revisa tsconfig.json.
    pause
    exit
)

echo Iniciando servidor...
call node dist/server.js

echo Servidor en ejecución...
pause