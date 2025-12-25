import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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
        note: ''
    });

    const [loading, setLoading] = useState(false);
    const [unpaidSupplies, setUnpaidSupplies] = useState([]);

    useEffect(() => {
        if (isOpen && supplier) {
            fetchUnpaidSupplies();
        }
    }, [isOpen, supplier]);

    const fetchUnpaidSupplies = async () => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers/${supplier._id}`);
            const data = await response.json();
            // Filter ledger for unpaid or partial invoices
            const unpaid = data.ledger.filter(entry =>
                entry.type === 'Invoice' && (entry.paymentStatus === 'Unpaid' || entry.paymentStatus === 'Partial')
            );
            setUnpaidSupplies(unpaid);

            // Transform for internal state
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

        if (totalSelectedAmount <= 0) {
            setError('Total payment amount must be greater than 0');
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
                    paymentData: {
                        date: formData.date,
                        method: formData.method,
                        note: formData.note
                    }
                })
            });

            if (response.ok) {
                showToast('Payment recorded successfully', 'success');
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Record Payment</h2>
                        <p className="text-gray-500 text-xs mt-1">Settle outstanding invoices for {supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
                    {/* Items List */}
                    {selectedItems.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Invoices to Settle</h3>
                            <div className="space-y-2">
                                {selectedItems.map((item, index) => (
                                    <div key={index}
                                        onClick={() => handleItemToggle(index)}
                                        className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${item.selected ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100 shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${item.selected ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200'
                                            }`}>
                                            {item.selected && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-800">{item.name}</div>
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                                Batch: {item.batchNumber} • Due: Rs {item.dueAmount?.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="w-28" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => handleItemAmountChange(index, e.target.value)}
                                                disabled={!item.selected}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-bold text-gray-700 outline-none focus:border-green-500 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center shadow-sm">
                            <p className="text-gray-400 font-semibold text-sm">No outstanding invoices found for this distributor.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Method</label>
                            <select
                                name="method"
                                value={formData.method}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Check">Check</option>
                                <option value="Supplier Credit">Supplier Credit</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Payment reference or internal notes..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 h-20 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Settle Amount</span>
                        <span className="text-xl font-bold text-green-600">Rs {totalSelectedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || totalSelectedAmount <= 0}
                            className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
