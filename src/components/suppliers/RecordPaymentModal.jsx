import React, { useState, useEffect } from 'react';
import { X, Check, Landmark, CreditCard, Banknote } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const RecordPaymentModal = ({ isOpen, onClose, onSuccess, supplier }) => {
    const { showToast } = useToast();
    const [error, setError] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        note: '',
        chequeNumber: '',
        chequeDate: new Date().toISOString().split('T')[0],
        bankName: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && supplier) {
            fetchUnpaidSupplies();
        }
    }, [isOpen, supplier]);

    const fetchUnpaidSupplies = async () => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers/${supplier._id}`);
            const data = await response.json();
            const unpaid = data.ledger.filter(entry =>
                entry.type === 'Invoice' && (entry.paymentStatus === 'Unpaid' || entry.paymentStatus === 'Partial')
            );

            const items = unpaid.map(u => ({
                supplyId: u.id,
                name: u.name,
                batchNumber: u.batchNumber,
                dueAmount: u.dueAmount,
                amount: u.dueAmount,
                selected: true,
                addedDate: u.addedDate
            }));
            setSelectedItems(items);
        } catch (error) {
            console.error('Error fetching unpaid supplies:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleItemToggle = (index) => {
        setSelectedItems(prev => prev.map((item, i) =>
            i === index ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleItemAmountChange = (index, value) => {
        const numValue = parseFloat(value) || 0;
        setSelectedItems(prev => prev.map((item, i) =>
            i === index ? { ...item, amount: Math.min(numValue, item.dueAmount) } : item
        ));
    };

    const totalSelectedAmount = selectedItems
        .filter(item => item.selected)
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const itemsToPayFor = selectedItems.filter(item => item.selected);

        if (itemsToPayFor.length === 0) {
            setError('Please select at least one item to pay for');
            return;
        }

        if (formData.method === 'Check' && (!formData.chequeNumber || !formData.bankName)) {
            setError('Please provide Cheque Number and Bank Name');
            return;
        }

        setLoading(true);
        try {
            const itemPayments = itemsToPayFor.map(item => ({
                supplyId: item.supplyId,
                amount: parseFloat(item.amount) || 0
            }));

            const response = await fetch(`${API_URL}/api/suppliers/${supplier._id}/pay-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: itemPayments,
                    paymentData: formData
                })
            });

            if (response.ok) {
                showToast(formData.method === 'Check' ? 'PDC recorded (Pending Clearance)' : 'Payment recorded successfully', 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to record payment');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('Error recording payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 text-gray-800">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">Payment Voucher</h2>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Settle dues for {supplier.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/20">
                    {/* Invoices List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Invoices</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((item, index) => (
                                    <div key={index}
                                        onClick={() => handleItemToggle(index)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${item.selected ? 'bg-white border-green-500 shadow-sm' : 'bg-white border-gray-100'}`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${item.selected ? 'bg-green-500 text-white' : 'bg-gray-100 border border-gray-200'}`}>
                                            {item.selected && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-800">{item.name}</div>
                                            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                                Batch: {item.batchNumber} • Due: Rs {item.dueAmount?.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="w-24" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => handleItemAmountChange(index, e.target.value)}
                                                disabled={!item.selected}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 outline-none focus:border-green-500"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-white border border-gray-100 rounded-xl text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-50">
                                    No pending invoices.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Method</label>
                            <div className="relative">
                                <select
                                    name="method"
                                    value={formData.method}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500 appearance-none shadow-sm"
                                >
                                    <option value="Cash">Cash (Manual)</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Check">Check (PDC)</option>
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {formData.method === 'Cash' ? <Banknote size={16} /> : formData.method === 'Check' ? <CreditCard size={16} /> : <Landmark size={16} />}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* PDC Fields */}
                    {formData.method === 'Check' && (
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4">
                            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={12} /> Cheque Details
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest ml-1">Cheque Number</label>
                                    <input
                                        type="text"
                                        name="chequeNumber"
                                        value={formData.chequeNumber}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-amber-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-amber-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="chequeDate"
                                        value={formData.chequeDate}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-amber-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-amber-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest ml-1">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-amber-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Remarks</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500 h-20 resize-none shadow-sm transition-all"
                        ></textarea>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div>
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Total Amount</span>
                        <span className="text-2xl font-bold text-green-600">Rs {totalSelectedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || totalSelectedAmount <= 0}
                            className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Record Payment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
