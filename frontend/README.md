# 📘 Attendance Management System

A **full-stack web application** for managing student attendance based on departments, subjects, and dates. Built with:

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **Database:** MongoDB

---

## ✨ Features
*🔹 Student attendnece management based on department,subjects and dates
*🔹 Mark and view attendance records
*🔹 Pie charts showing:
    > Overall attendance status
    > Attendance present count by department
    > Attendance present count by subject
*🔹 Responsive and modern UI built with **React + Vite**
*🔹 RESTful API using **Express.js** and **MongoDB**
*🔹 Scalable folder structure and clean codebase

---

## 🛠️ Getting Started

### ✅ Prerequisites

Make sure the following are installed:

* [Node.js](https://nodejs.org/) (v16 or higher)
* npm (comes with Node.js)
* [Git](https://git-scm.com/)

---

## 📦 Clone the Repository

```bash
git clone https://github.com/SAYAN957/Attendance_management_System.git
cd Attendance_management_System
```

---

## ⚙️ Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   * Copy `.env.example` to `.env` or create one manually:

     ```bash
     cp .env.example .env
     ```
   * Add your MongoDB connection string and desired port:

     ```
     MONGO_URI=your_mongodb_connection_url
     PORT=5000
     ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

   Backend will run at:
   🌐 `http://localhost:5000`

---

## 🌐 Frontend Setup

1. Open a new terminal and navigate to the frontend folder:

   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Frontend will run at:
   🌐 `http://localhost:5173`

---

## 🚀 Usage

Once both frontend and backend are running:

* Open your browser and visit:
  👉 `http://localhost:5173`

* Use the dashboard to:

  * Manage **Departments**, **Subjects**, and **Students**
  * **Mark** and **view** attendance records
  * View interactive charts on the dashboard, including:
    ✅ Overall attendance summary
    🏢 Attendance present count by Department
    📚 Attendance present count by Subject

---

## 🔐 Environment Variables Guide

No `.env` file is included for security reasons.
To create one in the backend folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-db
PORT=5000
```

If needed, you can also create `.env` for the frontend to store the API base URL:

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Don’t commit `.env` files to version control.

---

## 📂 Project Structure (Overview)

```
Attendance_management_System/
├── backend/        # Express server and MongoDB config
├── frontend/       # React + Vite frontend
│   └── public/     # Static files (e.g., index.html, icons)
│   └── src/        # Components, pages, API calls
├── README.md
└── ...
```

---

## 🤝 Contributing

Pull requests are welcome!
Please open an issue first to discuss what you would like to change.

