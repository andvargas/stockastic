# 📊 Trading App (React + Node + Mongo)

A simple trading journal web app to track, view, and update your trades.

## ✨ Features

- User Authentication (Register / Login)
- Role-based permissions: `admin`, `trader`, `viewer`
- View, filter and sort trade details
- Add, edit, and close trades (admin/trader only)
- Add personal journal notes per trade
- Filter trades by status or account type (Real Money / Paper Money)
- Summary cards for total trades, open positions, and total P/L
- Responsive, mobile-friendly UI with Tailwind CSS
- Toast notifications for success/error feedback (react-hot-toast)
- Progressive Web App (PWA): installable on iOS/Android with offline support
- Backend deployed on AWS EC2 (PM2 + Nginx proxy + SSL)
- Frontend deployed on Netlify with custom subdomain
- Secure environment variable management for production

## 📦 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, react-router-dom, react-hot-toast, Formik, Yup, vite-plugin-pwa
- **Backend:** Node.js v22, Express, Mongoose, bcrypt, jsonwebtoken
- **Database:** MongoDB Atlas
- **Deployment:** 
  - Backend: AWS EC2, PM2, Nginx, Certbot SSL
  - Frontend: Netlify
- **PWA:** Service Worker, manifest.json, install prompt handling

## 📂 Project Structure

/stockastic-api        → Node.js backend (Express, Mongo, JWT auth)
/stockastic-frontend   → React frontend (Vite + PWA + Tailwind)

## 🚀 Local Development

### Clone the repository

git clone https://github.com/andvargas/stockastic.git

## 🌐 Production Deployment

## Backend (AWS EC2 + PM2 + Nginx)

- Deployed via PM2 deploy with ecosystem.config.cjs
- Reverse proxied with Nginx (port 3000 → domain SSL)
- Node v22 managed via nvm
- .env kept on EC2 under /var/www/api-stockastic/current/
- PM2 logs to /home/ubuntu/.pm2/logs/

## Frontend (Netlify)

- Connected via GitHub repository
- Built automatically via Vite
- Deployed to: https://tradingapp.webtechsupport.co.uk
- PWA manifest + icons configured

### 📱 How to Install (PWA)

## On iPhone / iPad (Safari)

- Open the app URL
- Tap the Share icon
- Tap Add to Home Screen

## On Android (Chrome)

- Open the app URL
- Tap the Install App prompt in the address bar or browser menu

## 📌 To Do

- Trade performance charts
- Enhanced PWA offline sync
- Install prompt custom banners
- Email verification & password reset workflow
- Mobile deep linking for trade detail pages

## 👨‍💻 Built by

Andras Vargyas — [webtechsupport.co.uk](https://webtechsupport.co.uk)