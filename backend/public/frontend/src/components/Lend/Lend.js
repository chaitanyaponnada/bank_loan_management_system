import React, { useState } from 'react';
import './Lend.css';
import Modal from '../Modal/Modal';

const API_URL = 'http://localhost:3001/api/v1';

function Lend() {
    const [formData, setFormData] = useState({
        customer_id: '',
        loan_amount: '',
        loan_period_years: '',
        interest_rate_yearly: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null); 
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopyButtonText('Copied!');
        } catch (err) {
            setCopyButtonText('Failed');
        }
        document.body.removeChild(textArea);
    };
    
    const closeModalAndReset = () => {
        setIsModalOpen(false);
        setCopyButtonText('Copy');
        setModalData(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/loans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (!response.ok) {
                if (data.error && data.error.includes('Customer not found')) {
                    setModalData({ 
                        isError: true, 
                        message: `The Customer ID "${formData.customer_id}" does not exist. Please verify the ID or add the customer first.` 
                    });
                } else {
                    throw new Error(data.error || 'Failed to create loan.');
                }
            } else {
                setModalData(data);
                setFormData({ customer_id: '', loan_amount: '', loan_period_years: '', interest_rate_yearly: '' });
            }
            setIsModalOpen(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getModalTitle = () => {
        if (!modalData) return '';
        return modalData.isError ? "Customer Not Found" : "Loan Created Successfully";
    };

    return (
        <>
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModalAndReset} 
                title={getModalTitle()}
            >
                {modalData && (
                    modalData.isError ? (
                        <p>{modalData.message}</p>
                    ) : (
                        <>
                            <p>{`A new loan has been originated for ${modalData.customer_name}.`}</p>
                            <div className="modal-details">
                                <div className="modal-detail-item">
                                    <span className="modal-detail-label">Loan ID:</span>
                                    <div className="modal-value-container">
                                        <span className="modal-detail-value">{modalData.loan_id}</span>
                                        <button 
                                            className={`copy-button ${copyButtonText === 'Copied!' ? 'copied' : ''}`} 
                                            onClick={() => handleCopy(modalData.loan_id)}
                                        >
                                            {copyButtonText}
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-detail-item">
                                    <span className="modal-detail-label">Total Payable:</span>
                                    <span className="modal-detail-value">{`₹${modalData.total_amount_payable}`}</span>
                                </div>
                                <div className="modal-detail-item">
                                    <span className="modal-detail-label">Monthly EMI:</span>
                                    <span className="modal-detail-value">{`₹${modalData.monthly_emi}`}</span>
                                </div>
                            </div>
                        </>
                    )
                )}
            </Modal>

            

            <form onSubmit={handleSubmit} className="form-container payment-container">
                <h2 className="component-title">Create a New Loan</h2>
            <p className="component-subtitle">Issue a new loan to an existing customer.</p>
            <p className="component-subtitle">*Please make sure to copy the loan ID for further verification.</p>
                <input 
                    type="text" 
                    name="customer_id" 
                    value={formData.customer_id} 
                    onChange={handleChange} 
                    placeholder="Enter Customer ID" 
                    required 
                    disabled={isLoading}
                />
                <input 
                    type="number" 
                    name="loan_amount" 
                    value={formData.loan_amount} 
                    onChange={handleChange} 
                    placeholder="Loan Amount (₹)" 
                    required 
                    disabled={isLoading}
                />
                <input 
                    type="number" 
                    name="loan_period_years" 
                    value={formData.loan_period_years} 
                    onChange={handleChange} 
                    placeholder="Loan Period (Years)" 
                    required 
                    disabled={isLoading}
                />
                <input 
                    type="number" 
                    name="interest_rate_yearly" 
                    value={formData.interest_rate_yearly} 
                    onChange={handleChange} 
                    placeholder="Interest Rate (% Yearly)" 
                    required 
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Loan'}
                </button>
                {error && <p className="error">{error}</p>}
            </form>

            
        </>
    );
}

export default Lend;