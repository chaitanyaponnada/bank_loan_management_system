import React, { useState } from 'react';
import './Payment.css';
import Modal from '../Modal/Modal';

const API_URL = 'http://localhost:3001/api/v1';

function Payment() {
    const [formData, setFormData] = useState({
        loan_id: '',
        amount: '',
        payment_type: 'EMI'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: null });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeModalAndReset = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.loan_id.trim() || !formData.amount.trim()) {
            setError('Loan ID and Amount are required.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/loans/${formData.loan_id}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: formData.amount,
                    payment_type: formData.payment_type
                })
            });
            const data = await response.json();

            if (!response.ok) {
                if (data.error && data.error.toLowerCase().includes('loan not found')) {
                    setModalContent({
                        title: "Invalid Loan ID",
                        body: (
                            <>
                                <p>The Loan ID <strong>{formData.loan_id}</strong> is not associated with any active loan.</p>
                                <p>Please check the ID and try again.</p>
                            </>
                        )
                    });
                    setIsModalOpen(true);
                } else {
                    throw new Error(data.error || 'Failed to record payment.');
                }
            } else {
                if (data.loan_closed) {
                    if (parseFloat(data.overpaid_amount) > 0) {
                        setModalContent({
                            title: "Loan Closed & Refund Due",
                            body: <p>The loan for {data.customer_name} is fully paid. An overpayment of ₹{parseFloat(data.overpaid_amount).toFixed(2)} will be refunded.</p>
                        });
                    } else {
                        setModalContent({
                            title: "Loan Closed!",
                            body: <p>Congratulations, {data.customer_name}! This loan has been fully paid off.</p>
                        });
                    }
                } else {
                    setModalContent({
                        title: "Payment Successful",
                        body: <p>Payment of ₹{parseFloat(formData.amount).toFixed(2)} for {data.customer_name} was successful. The new remaining balance is ₹{parseFloat(data.remaining_balance).toFixed(2)}.</p>
                    });
                }
                setIsModalOpen(true);
                setFormData({ loan_id: '', amount: '', payment_type: 'EMI' });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isModalOpen}
                onClose={closeModalAndReset}
                title={modalContent.title}
            >
                {modalContent.body}
            </Modal>

            

            <form onSubmit={handleSubmit} className="form-container payment-container">
                <h2 className="component-title">Record a Payment</h2>
            <p className="component-subtitle">Submit an EMI or a lump sum amount for an active loan.</p>
                <input
                    type="text"
                    name="loan_id"
                    value={formData.loan_id}
                    onChange={handleChange}
                    placeholder="Loan ID"
                    required
                    disabled={isLoading}
                />
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Payment Amount (₹)"
                    required
                    disabled={isLoading}
                />
                <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    disabled={isLoading}
                >
                    <option value="EMI">EMI Payment</option>
                    <option value="LUMP_SUM">Lump Sum Payment</option>
                </select>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Record Payment'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}
        </>
    );
}

export default Payment;
