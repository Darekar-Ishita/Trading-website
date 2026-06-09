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

> 🚀 Perfect for learning stock trading, testing strategies, and understanding market behavior without investing real money.

