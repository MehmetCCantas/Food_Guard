@echo off
echo ==========================================
echo  g FoodGuard Yerel Calistirma Scripti g
echo ==========================================
echo.
echo [1/3] Lutfen Docker Desktop uygulamasini baslatin!
echo.
echo [2/3] Backend (PostgreSQL, Redis ve NestJS) baslatiliyor...
start cmd /k "cd foodguard-backend && docker-compose up"
echo.
echo [3/3] Frontend (Next.js) baslatiliyor...
start cmd /k "npm run dev"
echo.
echo ==========================================
echo  Sistem baslatildi!
echo  Frontend: http://localhost:3000
echo  Backend: http://localhost:3001
echo ==========================================
pause
