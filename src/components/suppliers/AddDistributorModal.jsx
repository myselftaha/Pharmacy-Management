import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const AddDistributorModal = ({ isOpen, onClose, onSuccess, initialData = null, isEditMode = false }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        creditDays: 30,
        outstandingBalance: 0
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                name: initialData.name || '',
                contactPerson: initialData.contactPerson || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                address: initialData.address || '',
                city: initialData.city || '',
                creditDays: initialData.creditDays || 30,
                outstandingBalance: initialData.totalPayable || 0
            });
        } else if (!isOpen) {
            setFormData({
                name: '',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                creditDays: 30,
                outstandingBalance: 0
            });
        }
    }, [isEditMode, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'creditDays' || name === 'outstandingBalance') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode
                ? `${API_URL}/api/suppliers/${initialData._id}`
                : `${API_URL}/api/suppliers`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(`Distributor ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                showToast(error.message || 'Error saving distributor', 'error');
            }
        } catch (error) {
            console.error('Error saving distributor:', error);
            showToast('Network error', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Edit Distributor' : 'Add New Distributor'}
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">
                            Fill in the details below to {isEditMode ? 'update' : 'add'} a distributor.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Company Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Muller & Phipps"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Contact Person *</label>
                            <input
                                type="text"
                                name="contactPerson"
                                required
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="e.g., Ahmed Khan"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Phone Number *</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g., 0321-1234567"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g., orders@company.pk"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Address *</label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="e.g., I.I Chundrigar Road"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">City *</label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g., Karachi"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Credit Days</label>
                            <input
                                type="number"
                                name="creditDays"
                                value={formData.creditDays}
                                onChange={handleChange}
                                placeholder="30"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Outstanding Balance (PKR)</label>
                        <input
                            type="number"
                            name="outstandingBalance"
                            value={formData.outstandingBalance}
                            onChange={handleChange}
                            disabled={isEditMode}
                            placeholder="0"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:opacity-50"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
                        >
                            {isEditMode ? 'Update Distributor' : 'Add Distributor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDistributorModal;
