import React, { useState } from 'react';
import './AddCustomer.css';
import Modal from '../Modal/Modal';

const API_URL = 'http://localhost:3001/api/v1';

function AddCustomer() {
    const [formData, setFormData] = useState({ customer_id: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState({ title: '', customerId: '', customerName: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add customer.');

            setModalInfo({
                title: 'Customer Created Successfully',
                customerId: data.customer_id,
                customerName: data.name,
            });
            setIsModalOpen(true);
            setFormData({ customer_id: '', name: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-customer-container">
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalInfo.title}
            >
                <div className="customer-details-list">
                    <div className="detail-item">
                        <span>Customer Name</span>
                        <strong>{modalInfo.customerName}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Customer ID</span>
                        <code>{modalInfo.customerId}</code>
                    </div>
                </div>
            </Modal>

            <h2 className="component-title">Add New Customer</h2>
            <p className="component-subtitle">Create a new customer profile in the system.</p>
    <p className="component-subtitle">*Add the customer first to lend a loan.</p>
            <form onSubmit={handleSubmit} className="form-container">
                <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    placeholder="Enter a unique Customer ID"
                    required
                    disabled={loading}
                />
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Customer's Full Name"
                    required
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Add Customer'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default AddCustomer;