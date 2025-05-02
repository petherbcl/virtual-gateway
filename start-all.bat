:: filepath: c:\Users\cardosopm\Projects\GatewayP2P\ProjectCode\GatewayP2P\virtual-gateway\start-all.bat
@echo off
echo Iniciando o backend...
start cmd /k "cd /d virtual-gateway-backend && mvnw spring-boot:run"

echo Iniciando o frontend...
@REM start cmd /k "cd /d virtual-gateway-frontend && npm run dev"
start cmd /k "cd /d virtual-gateway-frontend-2 && npm run dev"

echo Ambos os serviços foram iniciados.
@REM pause