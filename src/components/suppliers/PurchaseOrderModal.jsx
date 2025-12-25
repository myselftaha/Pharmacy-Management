import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const PurchaseOrderModal = ({ isOpen, onClose, supplier }) => {
    const { showToast } = useToast();
    const [medicines, setMedicines] = useState([]);
    const [orderItems, setOrderItems] = useState([
        { medicineId: '', medicineName: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [status, setStatus] = useState('Pending');
    const [expectedDelivery, setExpectedDelivery] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMedicines();
        }
    }, [isOpen]);

    const fetchMedicines = async () => {
        try {
            const response = await fetch(`${API_URL}/api/medicines`);
            const data = await response.json();
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    const addItem = () => {
        setOrderItems([...orderItems, { medicineId: '', medicineName: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index) => {
        if (orderItems.length > 1) {
            const newItems = orderItems.filter((_, i) => i !== index);
            setOrderItems(newItems);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        if (field === 'medicineId') {
            const med = medicines.find(m => m._id === value || m.id === Number(value));
            newItems[index].medicineId = value;
            newItems[index].medicineName = med ? med.name : '';
            newItems[index].unitPrice = med ? (med.costPrice || 0) : 0;
        } else {
            newItems[index][field] = value;
        }

        // Re-calculate total for the item
        if (field === 'quantity' || field === 'unitPrice' || field === 'medicineId') {
            newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
        }

        setOrderItems(newItems);
    };

    const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0);
    const gst = subtotal * 0.17; // 17% GST
    const total = subtotal + gst;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/purchase-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    distributorId: supplier._id,
                    distributorName: supplier.name,
                    items: orderItems,
                    status,
                    expectedDelivery,
                    notes,
                    subtotal,
                    gst,
                    total
                })
            });

            if (response.ok) {
                showToast('Purchase Order created successfully', 'success');
                onClose();
            } else {
                showToast('Failed to create purchase order', 'error');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            showToast('Network error', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Create Purchase Order</h2>
                        <p className="text-gray-500 text-xs mt-1">Create a new order for {supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Order Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={14} />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {orderItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:border-green-200 transition-all group">
                                    <div className="col-span-12 lg:col-span-5 space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Medicine / Product</label>
                                        <select
                                            value={item.medicineId}
                                            onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_8px_center] bg-no-repeat"
                                        >
                                            <option value="">Select medicine</option>
                                            {medicines.map(m => (
                                                <option key={m._id} value={m._id || m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-4 lg:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                        />
                                    </div>
                                    <div className="col-span-4 lg:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unit Price</label>
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                        />
                                    </div>
                                    <div className="col-span-3 lg:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Total</label>
                                        <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700">
                                            Rs {item.total.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex justify-end pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Order Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Expected Delivery</label>
                                    <input
                                        type="date"
                                        value={expectedDelivery}
                                        onChange={(e) => setExpectedDelivery(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Notes / Instructions</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions for the distributor..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 h-24 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 flex flex-col justify-center space-y-4 border border-gray-100 shadow-sm self-start">
                            <div className="flex justify-between items-center text-sm font-semibold text-gray-500 px-1">
                                <span>Subtotal</span>
                                <span>Rs {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold text-gray-500 px-1">
                                <span>GST (17%)</span>
                                <span>Rs {gst.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="flex justify-between items-center px-1">
                                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                                <span className="text-xl font-bold text-green-600">Rs {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={orderItems.some(i => !i.medicineId || i.quantity <= 0)}
                        className="flex-[2] px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Purchase Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;
