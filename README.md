# 💼 Bank Loan Management System

A **full-stack web application** designed to manage a simple banking loan system. This app enables users to **add customers, originate loans, process payments**, and **view detailed account and ledger information**.

---

## 🚀 Features

### 1. **Add Customer**
Register new customers using a unique Customer ID and full name.  
➡️ *A customer must be added before issuing a loan.*

### 2. **Lend (Create Loan)**
Issue a loan by specifying:
- Customer ID
- Loan Amount
- Tenure (in years)
- Annual Interest Rate

📌 The system calculates:
- Total Payable Amount
- Monthly EMI  
🔖 A unique **Loan ID** is generated.

### 3. **Make Payment**
Process payments for loans by entering:
- Loan ID
- Payment Amount

✅ The system updates the transaction history and balances.

### 4. **Ledger View**
View detailed loan transaction history:
- Principal & Interest Paid
- Total Amount Paid
- Remaining EMIs
- List of All Transactions

### 5. **Account Overview**
Get a full summary of all active and completed loans for a specific customer using their Customer ID.

---

## 🧭 How to Use

### 👉 1. Add a New Customer
- Navigate to the **Add Customer** tab.
- Enter **Customer ID** and **Name**.
- Click **Add Customer**.
- A confirmation modal will display the new customer info.

### 👉 2. Create a Loan
- Go to the **Lend** tab.
- Enter **Customer ID**, **Loan Amount**, **Tenure**, and **Interest Rate**.
- Click **Create Loan**.
- A modal displays:
  - Loan ID
  - Total Payable
  - Monthly EMI  
📌 *Copy the Loan ID for further operations.*

### 👉 3. Make a Payment
- Visit the **Make Payment** tab.
- Enter the **Loan ID** and **Payment Amount**.
- Click **Submit Payment**.
- A success message confirms the transaction.

### 👉 4. View Loan Details
- **Ledger Tab**: View transaction history by entering a Loan ID.
- **Account Overview Tab**: View all loans for a customer using their Customer ID.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** – JavaScript runtime
- **Express.js** – API framework
- **SQLite3** – Lightweight embedded database
- **CORS** – Cross-Origin Resource Sharing support

### Frontend
- **React.js** – UI library
- **CSS3** – Styled with modern **Glassmorphism** theme

---

## ⚙️ Installation & Setup

### 🔧 Prerequisites
- **Node.js** (with npm) must be installed.

---

### Step 1: Clone the Repository

```bash

Step 1: 

git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name

Step 2: Backend Setup


cd backend
npm install
npm start

cd ../frontend
npm install
npm start
```
Opens the app in your browser: http://localhost:3000

✅ Ready to Use
You now have:

Backend running on: http://localhost:3001

Frontend running on: http://localhost:3000
Use the application’s intuitive UI to manage loans easily.

📌 Notes
Always copy the Loan ID after loan creation.

All payments and ledger views require Loan ID.

Use Customer ID to manage or view loans per customer.

