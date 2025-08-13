import React, { useState } from 'react';
import './AccountOverview.css';

const API_URL = '/api/v1';
function AccountOverview() {
    const [customerId, setCustomerId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!customerId.trim()) return;
        setError('');
        setResult(null);
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/customers/${customerId}/overview`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch overview.');
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status = '') => status.replace('_', ' ').toUpperCase();

    const formatCurrency = (value) => {
        const number = parseFloat(value);
        return isNaN(number) ? 'N/A' : `₹${number.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="overview-container">
            <h2 className="component-title">Customer Account Overview</h2>
            
            <form onSubmit={handleFetch} className="form-container">
                <input 
                    type="text" 
                    value={customerId} 
                    onChange={(e) => setCustomerId(e.target.value)} 
                    placeholder="Enter Customer ID to view loans" 
                    required 
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Fetching...' : 'Get Overview'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {result && (
                <div className="overview-results">
                    <div className="overview-header">
                        <h3 className="overview-customer-name">{result.customer_name}</h3>
                        <p className="total-loans-info">
                            Has <strong>{result.total_loans}</strong> active or paid loan(s).
                        </p>
                    </div>

                    <ul className="loans-list">
                        {result.loans.map((loan) => (
                            <li key={loan.loan_id} className="loan-list-item">
                                <div className="loan-item-header">
                                    <div className="loan-id-container">
                                        <span>Loan ID</span>
                                        <code className="loan-id-value">{loan.loan_id}</code>
                                    </div>
                                    <span className={`status-badge status-${loan.status}`}>
                                        {formatStatus(loan.status)}
                                    </span>
                                </div>
                                <div className="loan-item-body">
                                    <div className="data-point">
                                        <label>Principal</label>
                                        <span>{formatCurrency(loan.principal)}</span>
                                    </div>
                                    <div className="data-point">
                                        <label>Total Payable</label>
                                        <span>{formatCurrency(loan.total_amount)}</span>
                                    </div>
                                    <div className="data-point">
                                        <label>Amount Paid</label>
                                        <span>{formatCurrency(loan.amount_paid)}</span>
                                    </div>
                                    <div className="data-point">
                                        <label>EMIs Left</label>
                                        <span>{loan.emis_left}</span>
                                    </div>
                                </div>
                                <div className="loan-item-footer">
                                    <span>
                                        Created: {new Date(loan.created_at).toLocaleString('en-IN', {
                                            timeZone: 'Asia/Kolkata',
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AccountOverview;