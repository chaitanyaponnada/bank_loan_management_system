import React, { useState } from 'react';
import './Ledger.css';

const API_URL = 'http://localhost:3001/api/v1';

function Ledger() {
    const [loanId, setLoanId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!loanId.trim()) return;

        setError('');
        setResult(null);
        try {
            const response = await fetch(`${API_URL}/loans/${loanId}/ledger`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch ledger.');
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatStatus = (status = '') => status.replace(/_/g, ' ').toUpperCase();
    const formatCurrency = (value) =>
        isNaN(value) ? 'N/A' : `₹${parseFloat(value).toLocaleString('en-IN')}`;

    return (
        <div className="ledger-container">
            <h2 className="component-title">View Loan Ledger</h2>

            <form onSubmit={handleFetch} className="form-container">
                <input
                    type="text"
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                    placeholder="Enter Loan ID"
                    required
                />
                <button type="submit">Get Ledger</button>
            </form>

            {error && <p className="error">{error}</p>}

            {result && (
                <div className="ledger-results">
                    <div className="ledger-header">
                        <h3 className="customer-name">{result.customer_name}</h3>
                        <div className="loan-meta">
                            <span><strong>Loan ID:</strong> <code>{result.loan_id}</code></span>
                            <span><strong>Status:</strong> 
                                <span className={`status-badge status-${result.status}`}>{formatStatus(result.status)}</span>
                            </span>
                            <span><strong>EMIs Left:</strong> {result.emis_left ?? 'N/A'}</span>
                        </div>
                    </div>

                    <div className="ledger-summary-grid">
                        <div className="data-point">
                            <label>Principal</label>
                            <span>{formatCurrency(result.principal)}</span>
                        </div>
                        <div className="data-point">
                            <label>Total Payable</label>
                            <span>{formatCurrency(result.total_amount)}</span>
                        </div>
                        <div className="data-point">
                            <label>Amount Paid</label>
                            <span>{formatCurrency(result.amount_paid)}</span>
                        </div>
                        <div className="data-point">
                            <label>Balance</label>
                            <span>{formatCurrency(result.balance_amount)}</span>
                        </div>
                        <div className="data-point">
                            <label>Monthly EMI</label>
                            <span>{formatCurrency(result.monthly_emi)}</span>
                        </div>
                    </div>

                    <div className="transactions-section">
                        <h4>Transactions</h4>
                        <div className="table-wrapper">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date & Time (IST)</th>
                                        <th>Type</th>
                                        <th className="amount-header">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(result.transactions) && result.transactions.length > 0 ? (
                                        result.transactions.map((tx) => (
                                            <tr key={tx.transaction_id}>
                                                <td>{tx.transaction_id}</td>
                                                <td>{tx.date ? new Date(tx.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</td>
                                                <td>{tx.type || 'N/A'}</td>
                                                <td className="amount-cell">{formatCurrency(tx.amount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="no-transactions">No transactions found for this loan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ledger;
