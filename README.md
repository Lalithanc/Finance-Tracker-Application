# FinPal — Personal Finance Tracker

FinPal is a full-stack personal finance tracking application that helps users manage budgets, log transactions, and analyze spending over time.

## Key Features

- Add, edit, and delete transactions with revenue/expense support
- View current net balance in real time
- Filter transactions on the Reports page by date, category, and amount range
- View category-level expense summaries and spend statistics
- Supports local persistence with MySQL via Sequelize ORM
- Clean React UI built with Vite and Tailwind CSS

## Technologies Used

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Day.js
- Chart.js / react-chartjs-2
- Heroicons & React Icons
- Sonner notification library

### Backend

- Node.js
- Express
- Sequelize ORM
- MySQL / MariaDB
- mysql2
- CORS
- nodemon

## Important Pages

### Home Page

- Transaction form for adding expenses and income
- Transaction list with inline edit and delete actions
- Current balance display
- Expense / revenue type toggles

### Reports Page

- Filter by start date and end date
- Filter by category selection
- Filter by minimum and maximum amount
- Display filtered transactions and aggregated statistics
- Show category spend breakdowns and average spending

## API Endpoints

The backend server exposes the following endpoints on `http://localhost:5001`:

- `GET /api/transactions` — fetch all transactions
- `POST /api/transactions` — create a new transaction
- `PUT /api/transactions/:id` — update a transaction
- `DELETE /api/transactions/:id` — delete a transaction
- `GET /api/categories` — fetch transaction categories
- `GET /api/reports/statistics` — fetch filtered statistics and transactions
- `GET /api/reports/category-summary/:userId` — category summary per user

## Project Structure

```
FinPal/
├── README.md
├── README.txt
├── backend/
│   ├── app.js
│   └── package.json
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── postcss.config.mjs
    ├── README.md
    ├── public/
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets/
        ├── components/
        │   ├── Features.jsx
        │   ├── Form.jsx
        │   └── Header.jsx
        └── pages/
            ├── HomePage.jsx
            ├── HomePageMain.jsx
            └── Reports.jsx
```

## Installation and Local Run

1. Clone the repository:

```bash
git clone https://github.com/Lalithanc/FinPal.git
cd FinPal
```

2. Start the backend:

```bash
cd backend
npm install
npm start
```

3. Start the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

4. Open the app in your browser:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

