import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Save } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const ReceiveStockModal = ({ isOpen, onClose, order, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (isOpen && order) {
            // Initialize items with order data
            setItems(order.items.map(item => ({
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                orderedQuantity: item.billedQuantity,
                receivedQuantity: item.billedQuantity,
                bonusQuantity: item.bonusQuantity || 0,
                batchNumber: '',
                expiryDate: '',
                unitPrice: item.unitPrice,
                netItemTotal: item.netItemTotal
            })));
        }
    }, [isOpen, order]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Recalculate total if quantity changes
        if (field === 'receivedQuantity') {
            const qty = Number(value) || 0;
            const price = Number(newItems[index].unitPrice) || 0;
            newItems[index].netItemTotal = qty * price;
        }

        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const incompleteItem = items.find(i => !i.batchNumber || !i.expiryDate);
        if (incompleteItem) {
            showToast('Please provide Batch Number and Expiry Date for all items', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/purchase-orders/${order._id}/receive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            if (response.ok) {
                showToast('Stock received and inventory updated', 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const err = await response.json();
                showToast(err.message || 'Failed to receive stock', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Save size={24} className="text-[#00c950]" />
                            Receive Stock & Verify Inventory
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">Order #{order._id.slice(-6).toUpperCase()} from {order.distributorName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-[#00c950]/30 hover:shadow-md">
                                <div className="grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Medicine</label>
                                        <div className="font-bold text-gray-900 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                            {item.medicineName}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.receivedQuantity}
                                            onChange={(e) => handleItemChange(index, 'receivedQuantity', e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#00c950] focus:ring-4 focus:ring-[#00c950]/10 transition-all"
                                            placeholder="Qty"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Ordered: {item.orderedQuantity}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bonus Qty</label>
                                        <input
                                            type="number"
                                            value={item.bonusQuantity}
                                            onChange={(e) => handleItemChange(index, 'bonusQuantity', e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#00c950] focus:ring-4 focus:ring-[#00c950]/10 transition-all"
                                            placeholder="Bonus"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-[#00c950]">Batch #</label>
                                        <input
                                            type="text"
                                            value={item.batchNumber}
                                            onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                                            className="w-full bg-[#00c950]/5 border border-[#00c950]/20 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#00c950] focus:ring-4 focus:ring-[#00c950]/20 transition-all"
                                            placeholder="Required"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-red-500">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={item.expiryDate}
                                            onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                                            className="w-full bg-red-50/50 border border-red-100 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                        <AlertCircle size={18} />
                        <span className="text-xs font-bold uppercase tracking-tight">Updating inventory is an atomic process</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#00c950] hover:bg-[#00b347] disabled:bg-gray-300 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#00c950]/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Verify & Add to Stock
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiveStockModal;
