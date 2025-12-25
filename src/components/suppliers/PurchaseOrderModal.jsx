import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info, Package, AlertCircle } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';

const PurchaseOrderModal = ({ isOpen, onClose, supplier }) => {
    const { showToast } = useToast();
    const [medicines, setMedicines] = useState([]);
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [distributorInvoice, setDistributorInvoice] = useState('');
    const [orderItems, setOrderItems] = useState([
        {
            medicineId: '',
            medicineName: '',
            billedQuantity: 1,
            bonusQuantity: 0,
            batchNumber: '',
            expiryDate: '',
            unitPrice: 0, // TP
            tradeDiscount: 0,
            netItemTotal: 0,
            costPerUnit: 0,
            currentStock: 0
        }
    ]);
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
        setOrderItems([...orderItems, {
            medicineId: '',
            medicineName: '',
            billedQuantity: 1,
            bonusQuantity: 0,
            batchNumber: '',
            expiryDate: '',
            unitPrice: 0,
            tradeDiscount: 0,
            netItemTotal: 0,
            costPerUnit: 0,
            currentStock: 0
        }]);
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
            newItems[index].currentStock = med ? (med.stock || 0) : 0;
        } else {
            newItems[index][field] = value;
        }

        // Re-calculate row
        const billed = Number(newItems[index].billedQuantity) || 0;
        const bonus = Number(newItems[index].bonusQuantity) || 0;
        const tp = Number(newItems[index].unitPrice) || 0;
        const disc = Number(newItems[index].tradeDiscount) || 0;

        const gross = billed * tp;
        const discAmt = gross * (disc / 100);
        const netTotal = gross - discAmt;
        const totalUnits = billed + bonus;

        newItems[index].netItemTotal = netTotal;
        newItems[index].costPerUnit = totalUnits > 0 ? (netTotal / totalUnits) : 0;

        setOrderItems(newItems);
    };

    const subtotal = orderItems.reduce((acc, item) => acc + item.netItemTotal, 0);
    const gstAmount = subtotal * 0.17; // Standard 17%

    // Logic for WHT (Advance Tax) if Non-Filer: 0.5% - 2% depending on region, setting 1% for demo
    const whtAmount = supplier.filerStatus === 'Non-Filer' ? (subtotal * 0.01) : 0;

    const grandTotal = subtotal + gstAmount + whtAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for Batch and Expiry
        const invalidItem = orderItems.find(i => !i.batchNumber || !i.expiryDate || !i.medicineId);
        if (invalidItem) {
            showToast('Please fill Batch, Expiry, and Medicine for all rows', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/purchase-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    distributorId: supplier._id,
                    distributorInvoiceNumber: distributorInvoice,
                    invoiceDate: orderDate,
                    items: orderItems,
                    notes,
                    subtotal,
                    gstAmount,
                    whtAmount,
                    total: grandTotal
                })
            });

            if (response.ok) {
                showToast('Stock received and inventory updated', 'success');
                onClose();
            } else {
                showToast('Failed to record purchase', 'error');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            showToast('Network error', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">New Purchase Invoice</h2>
                            <p className="text-gray-500 text-xs mt-1">Recording stock from <span className="text-gray-900 font-bold">{supplier.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/20">
                    {/* Invoice Header Details */}
                    <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Distributor Invoice #</label>
                            <input
                                type="text"
                                value={distributorInvoice}
                                onChange={(e) => setDistributorInvoice(e.target.value)}
                                placeholder="e.g. INV-9921"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Invoice Date</label>
                            <input
                                type="date"
                                value={orderDate}
                                onChange={(e) => setOrderDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Distributor Tax Status</label>
                            <div className={`w-full ${supplier.filerStatus === 'Filer' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2`}>
                                {supplier.filerStatus === 'Filer' ? <Info size={14} /> : <AlertCircle size={14} />}
                                {supplier.filerStatus} {supplier.filerStatus === 'Non-Filer' && '(1% WHT Applied)'}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Items Breakdown</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={14} />
                                <span>Add Row</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {orderItems.map((item, index) => (
                                <div key={index} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:border-green-200 transition-all relative group">
                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Row 1: Medicine, Batch, Expiry */}
                                        <div className="col-span-12 lg:col-span-11 grid grid-cols-12 gap-4">
                                            <div className="col-span-5 space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>Product *</span>
                                                    {item.medicineId && <span className="text-blue-500 text-[9px] font-semibold">Stock: {item.currentStock}</span>}
                                                </label>
                                                <select
                                                    value={item.medicineId}
                                                    onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_8px_center] bg-no-repeat"
                                                >
                                                    <option value="">Search Medicine...</option>
                                                    {medicines.map(m => (
                                                        <option key={m._id} value={m._id || m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-3 space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Batch *</label>
                                                <input
                                                    type="text"
                                                    value={item.batchNumber}
                                                    onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                                                    placeholder="BN-992"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div className="col-span-4 space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry *</label>
                                                <input
                                                    type="date"
                                                    value={item.expiryDate}
                                                    onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-12 lg:col-span-1 self-center flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Row 2: Qty, Bonus, TP, Disc, Net */}
                                        <div className="col-span-12 grid grid-cols-6 gap-4 mt-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Billed Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.billedQuantity}
                                                    onChange={(e) => handleItemChange(index, 'billedQuantity', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Bonus (10+1)</label>
                                                <input
                                                    type="number"
                                                    value={item.bonusQuantity}
                                                    onChange={(e) => handleItemChange(index, 'bonusQuantity', e.target.value)}
                                                    className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-3 py-2 text-sm font-bold text-blue-600 outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Trade Price (TP)</label>
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Trade Disc %</label>
                                                <input
                                                    type="number"
                                                    value={item.tradeDiscount}
                                                    onChange={(e) => handleItemChange(index, 'tradeDiscount', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Net Total</label>
                                                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-black text-gray-800">
                                                    Rs {item.netItemTotal.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest ml-1">Cost / Unit</label>
                                                <div className="w-full bg-green-50/50 border border-green-100 rounded-lg px-3 py-2 text-sm font-black text-green-600">
                                                    Rs {item.costPerUnit.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer and Summary */}
                <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-12 gap-8 flex-shrink-0">
                    <div className="col-span-7 space-y-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Internal remarks for this entry..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 h-24 resize-none transition-all"
                        ></textarea>
                    </div>

                    <div className="col-span-5 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 px-1 uppercase tracking-widest">
                            <span>Net Taxable</span>
                            <span className="text-gray-600">Rs {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 px-1 uppercase tracking-widest">
                            <span>GST (17%)</span>
                            <span className="text-gray-600">Rs {gstAmount.toLocaleString()}</span>
                        </div>
                        {whtAmount > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-bold text-red-400 px-1 uppercase tracking-widest">
                                <span>WHT Tax</span>
                                <span>+ Rs {whtAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-100 my-1"></div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">Total Payable</span>
                            <span className="text-2xl font-bold text-green-600">Rs {grandTotal.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-[2] px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                Finalize Stock
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;
