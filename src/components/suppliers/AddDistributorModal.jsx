import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const AddDistributorModal = ({ isOpen, onClose, onSuccess, initialData = null, isEditMode = false }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        parentCompany: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        ntn: '',
        strn: '',
        filerStatus: 'Filer',
        creditDays: 30,
        openingBalance: {
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            type: 'Debit'
        }
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                name: initialData.name || '',
                parentCompany: initialData.parentCompany || '',
                contactPerson: initialData.contactPerson || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                address: initialData.address || '',
                city: initialData.city || '',
                ntn: initialData.ntn || '',
                strn: initialData.strn || '',
                filerStatus: initialData.filerStatus || 'Filer',
                creditDays: initialData.creditDays || 30,
                openingBalance: initialData.openingBalance || {
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Debit'
                }
            });
        } else if (!isOpen) {
            setFormData({
                name: '',
                parentCompany: '',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                ntn: '',
                strn: '',
                filerStatus: 'Filer',
                creditDays: 30,
                openingBalance: {
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Debit'
                }
            });
        }
    }, [isEditMode, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('openingBalance.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                openingBalance: {
                    ...prev.openingBalance,
                    [field]: field === 'amount' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'creditDays' ? Number(value) : value
            }));
        }
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Edit Distributor' : 'Add New Distributor'}
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">
                            Fields marked with * are mandatory for tax compliance.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white overflow-y-auto custom-scrollbar flex-1">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Distributor Name *</label>
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
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Parent Company</label>
                                <input
                                    type="text"
                                    name="parentCompany"
                                    value={formData.parentCompany}
                                    onChange={handleChange}
                                    placeholder="e.g., GSK, Abbott, Getz"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Phone Number *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="03xx-xxxxxxx"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax & Compliance Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tax & Compliance</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">NTN</label>
                                <input
                                    type="text"
                                    name="ntn"
                                    value={formData.ntn}
                                    onChange={handleChange}
                                    placeholder="XXXXXXX-X"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">STRN</label>
                                <input
                                    type="text"
                                    name="strn"
                                    value={formData.strn}
                                    onChange={handleChange}
                                    placeholder="XX-XX-XXXX-XXX-XX"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Tax Status</label>
                                <select
                                    name="filerStatus"
                                    value={formData.filerStatus}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
                                >
                                    <option value="Filer">Tax Filer</option>
                                    <option value="Non-Filer">Non-Filer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Accounting Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Accounting & Balance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Allowed Credit Days</label>
                                <input
                                    type="number"
                                    name="creditDays"
                                    value={formData.creditDays}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                            <div className="space-y-1.5 opacity-50 pointer-events-none">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="orders@distributor.pk"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                        </div>

                        {!isEditMode && (
                            <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3 border border-blue-100/50">
                                <div className="flex justify-between items-center px-1">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Onboarding Balance</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Amount</label>
                                        <input
                                            type="number"
                                            name="openingBalance.amount"
                                            value={formData.openingBalance.amount}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-700 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Type</label>
                                        <select
                                            name="openingBalance.type"
                                            value={formData.openingBalance.type}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-700 outline-none focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%233B82F6%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                                        >
                                            <option value="Debit">Payable (We Owe)</option>
                                            <option value="Credit">Receivable (Credit)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">As Of</label>
                                        <input
                                            type="date"
                                            name="openingBalance.date"
                                            value={formData.openingBalance.date}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-700 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex gap-3 bg-white flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="flex-[2] px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                        {isEditMode ? 'Update Details' : 'Register Distributor'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddDistributorModal;
