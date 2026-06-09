# 📈 Trading App

A full-stack 🇮🇳 Indian stock paper trading platform that lets you simulate real stock market trading with live data — without risking real money 💸.

## ✨ Features

* 🔐 User authentication (Signup / Login / JWT)
* 📊 Real-time stock data and interactive charts
* 📰 News aggregation related to stocks and markets
* ⭐ Watchlists and portfolio management
* 💰 Wallet and order/trade management
* 📈 Paper trading with virtual funds
* ⚡ Live market insights and stock tracking

## 🛠️ Tech Stack

* 🚀 Backend: Node.js, Express
* 🗄️ Database: MongoDB
* 🎨 Frontend: React (Vite)
* 📡 External Data: Yahoo Finance / Custom Stock Service

## 📋 Prerequisites

* 🟢 Node.js (v16+ recommended)
* 📦 npm or yarn
* 🍃 MongoDB (local or hosted)

## 🚀 Quick Start

### 1️⃣ Backend Setup

```bash
cd backend
npm install
# create a .env file (see example below)
node server.js
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Variables (.env Example)

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
MONGODB_PASSWORD=your_password_of_mongodb
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_news_api_key
```

## 📂 Project Structure

### 🖥️ Backend

* 📁 `controllers/` — Request handlers (auth, stock, trade, user, wallet, watchlist, news)
* 📁 `models/` — Mongoose models (user, order, wallet, watchlist)
* 📁 `routes/` — Express routes
* 📁 `services/` — Business logic and external API wrappers (e.g., Yahoo Finance)
* 📁 `config/` — Database and application configuration

### 🎨 Frontend

* 📁 `src/pages/` — App pages (Dashboard, Login, News, Watchlist, Portfolio, etc.)
* 📁 `src/components/` — Reusable UI components
* 📁 `src/context/` — Authentication and theme contexts
* 📁 `src/services/` — Frontend API calls and services

## 🎯 Key Highlights

* 📈 Simulate stock market trading risk-free
* 💹 Track portfolio performance in real time
* 🔔 Stay updated with market news
* ⭐ Build personalized watchlists
* 💰 Practice trading strategies with virtual capital
* 🔒 Secure authentication and user management

## Website

<img width="1919" height="871" alt="Screenshot 2026-06-09 140037" src="https://github.com/user-attachments/assets/3a66b78e-05e3-4841-b4db-acf40acc0a2d" />
<img width="1893" height="814" alt="Screenshot 2026-06-09 140144" src="https://github.com/user-attachments/assets/2df78eb3-ce87-4d54-a31e-4a350299484c" />
<img width="1894" height="876" alt="Screenshot 2026-06-09 140226" src="https://github.com/user-attachments/assets/8796ea51-8b9f-43f6-99b9-009ad89fd425" />
<img width="1919" height="818" alt="Screenshot 2026-06-09 140302" src="https://github.com/user-attachments/assets/13c7cbf9-2fa1-4d88-befa-140bc0488d16" />
<img width="1919" height="876" alt="Screenshot 2026-06-09 140453" src="https://github.com/user-attachments/assets/49af270e-b242-4064-81ef-eeb4aea1e8c9" />
<img width="1919" height="876" alt="Screenshot 2026-06-09 140516" src="https://github.com/user-attachments/assets/1adb0239-5c03-452f-a3c3-02aa07df5705" />



> 🚀 Perfect for learning stock trading, testing strategies, and understanding market behavior without investing real money.


