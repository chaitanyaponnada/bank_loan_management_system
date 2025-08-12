const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Connection
const db = new sqlite3.Database('./bank.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the bank database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Loans (
        loan_id TEXT PRIMARY KEY,
        customer_id TEXT,
        principal_amount DECIMAL NOT NULL,
        total_amount DECIMAL NOT NULL,
        interest_rate DECIMAL NOT NULL,
        loan_period_years INTEGER NOT NULL,
        monthly_emi DECIMAL NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Payments (
        payment_id TEXT PRIMARY KEY,
        loan_id TEXT,
        amount DECIMAL NOT NULL,
        payment_type TEXT,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES Loans(loan_id)
    )`);

});

module.exports = db;