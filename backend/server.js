const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const API_BASE_URL = '/api/v1';

// Add a new customer
app.post(`${API_BASE_URL}/customers`, (req, res) => {
    const { customer_id, name } = req.body;
    if (!customer_id || !name) {
        return res.status(400).json({ error: "customer_id and name are required." });
    }
    const sql = `INSERT INTO Customers (customer_id, name) VALUES (?, ?)`;
    db.run(sql, [customer_id, name], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: `Customer with ID ${customer_id} already exists.` });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Customer created successfully.", customer_id, name });
    });
});

// LEND
app.post(`${API_BASE_URL}/loans`, (req, res) => {
    const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;
    db.get(`SELECT * FROM Customers WHERE customer_id = ?`, [customer_id], (err, customer) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!customer) return res.status(404).json({ error: `Customer with ID ${customer_id} not found.` });

        const P = parseFloat(loan_amount);
        const N = parseInt(loan_period_years);
        const R = parseFloat(interest_rate_yearly);
        const totalInterest = P * N * (R / 100);
        const totalAmount = P + totalInterest;
        const monthlyEmi = totalAmount / (N * 12);
        const loan_id = uuidv4();
        
        
        const created_at = new Date().toISOString(); 

        const sql = `INSERT INTO Loans (loan_id, customer_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`;
        
        db.run(sql, [loan_id, customer_id, P, totalAmount, R, N, monthlyEmi, created_at], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ 
                loan_id, 
                customer_id, 
                customer_name: customer.name,
                total_amount_payable: totalAmount.toFixed(2), 
                monthly_emi: monthlyEmi.toFixed(2) 
            });
        });
    });
});

// PAYMENT
app.post(`${API_BASE_URL}/loans/:loan_id/payments`, (req, res) => {
    const { loan_id } = req.params;
    const { amount, payment_type } = req.body;
    const paymentAmount = parseFloat(amount);
    
    const loanSql = `
        SELECT l.*, c.name as customer_name
        FROM Loans l
        JOIN Customers c ON l.customer_id = c.customer_id
        WHERE l.loan_id = ?
    `;
    db.get(loanSql, [loan_id], (err, loan) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!loan) return res.status(404).json({ error: "Loan not found." });
        
        db.get(`SELECT SUM(amount) AS total_paid FROM Payments WHERE loan_id = ?`, [loan_id], (err, paymentSum) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalPaidBefore = paymentSum.total_paid || 0;
            const balanceBefore = loan.total_amount - totalPaidBefore;

            if (balanceBefore <= 0) {
                 return res.status(400).json({ error: "This loan has already been paid off." });
            }
            
            const amountToRecord = Math.min(paymentAmount, balanceBefore);
            const overpaidAmount = paymentAmount - amountToRecord;
            
            const payment_id = uuidv4();
            const payment_date = new Date().toISOString(); 
            
            const insertSql = `INSERT INTO Payments (payment_id, loan_id, amount, payment_type, payment_date) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertSql, [payment_id, loan_id, amountToRecord, payment_type, payment_date], function(err) {
                if (err) return res.status(500).json({ error: err.message });

                const newTotalPaid = totalPaidBefore + amountToRecord;
                const newBalance = loan.total_amount - newTotalPaid;
                
                let responsePayload = {
                    payment_id,
                    loan_id,
                    customer_name: loan.customer_name
                };

                if (newBalance <= 0) {
                    db.run(`UPDATE Loans SET status = 'PAID_OFF' WHERE loan_id = ?`, [loan_id], (updateErr) => {
                        if (updateErr) return res.status(500).json({ error: updateErr.message });
                        
                        res.status(200).json({
                            ...responsePayload,
                            message: "Loan has been fully paid and is now closed.",
                            loan_closed: true,
                            overpaid_amount: overpaidAmount.toFixed(2),
                            remaining_balance: '0.00'
                        });
                    });
                } else {
                    res.status(200).json({
                        ...responsePayload,
                        message: "Payment recorded successfully.",
                        loan_closed: false,
                        overpaid_amount: '0.00',
                        remaining_balance: newBalance.toFixed(2)
                    });
                }
            });
        });
    });
});

// LEDGER
app.get(`${API_BASE_URL}/loans/:loan_id/ledger`, (req, res) => {
    const { loan_id } = req.params;
    const loanSql = `
        SELECT l.*, c.name as customer_name 
        FROM Loans l
        JOIN Customers c ON l.customer_id = c.customer_id
        WHERE l.loan_id = ?
    `;
    db.get(loanSql, [loan_id], (err, loan) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!loan) return res.status(404).json({ error: "Loan not found." });

        const paymentsSql = `SELECT * FROM Payments WHERE loan_id = ? ORDER BY payment_date ASC`;
        db.all(paymentsSql, [loan_id], (err, payments) => {
            if (err) return res.status(500).json({ error: err.message });
            const amount_paid = payments.reduce((sum, p) => sum + p.amount, 0);
            const balance_amount = loan.total_amount - amount_paid;
            const emis_left = Math.max(0, Math.ceil(balance_amount / loan.monthly_emi));
            
            res.json({
                loan_id: loan.loan_id,
                customer_id: loan.customer_id,
                customer_name: loan.customer_name,
                principal: loan.principal_amount,
                total_amount: loan.total_amount,
                monthly_emi: loan.monthly_emi,
                status: loan.status,
                amount_paid: amount_paid.toFixed(2),
                balance_amount: balance_amount.toFixed(2),
                emis_left,
                transactions: payments.map(p => ({
                    transaction_id: p.payment_id,
                    date: p.payment_date,
                    amount: p.amount,
                    type: p.payment_type
                }))
            });
        });
    });
});

// ACCOUNT OVERVIEW
app.get(`${API_BASE_URL}/customers/:customer_id/overview`, (req, res) => {
    const { customer_id } = req.params;
    db.get(`SELECT name FROM Customers WHERE customer_id = ?`, [customer_id], (err, customer) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!customer) return res.status(404).json({ error: "Customer not found." });

        const sql = `SELECT * FROM Loans WHERE customer_id = ? ORDER BY created_at DESC`;
        db.all(sql, [customer_id], async (err, loans) => {
            if (err) return res.status(500).json({ error: err.message });
            const loanDetails = await Promise.all(loans.map(loan =>
                new Promise((resolve) => {
                    const paymentsSql = `SELECT SUM(amount) AS total_paid FROM Payments WHERE loan_id = ?`;
                    db.get(paymentsSql, [loan.loan_id], (err, payment) => {
                        const amount_paid = payment?.total_paid || 0;
                        const balance = loan.total_amount - amount_paid;
                        const emis_left = Math.max(0, Math.ceil(balance / loan.monthly_emi));
                        
                        resolve({
                            loan_id: loan.loan_id,
                            principal: loan.principal_amount,
                            total_amount: loan.total_amount,
                            status: loan.status,
                            total_interest: (loan.total_amount - loan.principal_amount).toFixed(2),
                            emi_amount: loan.monthly_emi.toFixed(2),
                            amount_paid: amount_paid.toFixed(2),
                            emis_left,
                            created_at: loan.created_at
                        });
                    });
                })
            ));
            res.json({ customer_id, customer_name: customer.name, total_loans: loans.length, loans: loanDetails });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
