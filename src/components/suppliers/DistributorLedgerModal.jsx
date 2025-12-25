import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ChevronRight, CheckCircle2, AlertCircle, Clock, Building2, RotateCcw } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';
import RecordPaymentModal from './RecordPaymentModal';
import PurchaseReturnModal from './PurchaseReturnModal';

const DistributorLedgerModal = ({ isOpen, onClose, supplier }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('ledger');
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && supplier) {
            fetchLedger();
            fetchPurchaseOrders();
        }
    }, [isOpen, supplier]);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/suppliers/${supplier._id}`);
            const data = await response.json();
            setLedgerData(data);
        } catch (error) {
            console.error('Error fetching ledger:', error);
            showToast('Failed to fetch ledger details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/purchase-orders/supplier/${supplier._id}`);
            const data = await response.json();
            setPurchaseOrders(data);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        }
    };

    const handleUpdateCheque = async (paymentId, status) => {
        try {
            const response = await fetch(`${API_URL}/api/payments/${paymentId}/clear-cheque`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                showToast(`Cheque status updated to ${status}`, 'success');
                fetchLedger();
            }
        } catch (error) {
            console.error('Error updating cheque:', error);
            showToast('Failed to update cheque', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 text-gray-800">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{supplier.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-gray-500 text-xs font-semibold flex items-center gap-1">
                                    <Clock size={12} /> Last Order: {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${supplier.filerStatus === 'Filer' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {supplier.filerStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
                    {/* Stats Summary Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Purchases</p>
                            <h3 className="text-xl font-bold text-red-500">Rs {ledgerData?.stats?.totalPurchased?.toLocaleString() || 0}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Payments</p>
                            <h3 className="text-xl font-bold text-green-600">Rs {ledgerData?.stats?.totalPaid?.toLocaleString() || 0}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-b-4 border-b-amber-400">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Outstanding Audit</p>
                            <h3 className="text-xl font-bold text-amber-500">Rs {ledgerData?.stats?.balance?.toLocaleString() || 0}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Credit Limit</p>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-xl font-bold text-gray-700">{supplier.creditDays || 30}</h3>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Days</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
                        {/* Custom Tabs */}
                        <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('ledger')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 tracking-wide ${activeTab === 'ledger' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Detailed Ledger
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 tracking-wide ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Purchase Invoices
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="flex items-center gap-2 bg-white border border-red-100 text-red-500 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-all active:scale-95"
                            >
                                <RotateCcw size={16} />
                                <span>Return Items</span>
                            </button>
                            <button
                                onClick={() => setIsRecordPaymentOpen(true)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={16} />
                                <span>New Payment</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            <p className="text-xs font-bold text-gray-400">Fetching Financial Records...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                            {activeTab === 'ledger' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Reference</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Debit</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Credit</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {ledgerData?.ledger?.length > 0 ? (
                                                ledgerData.ledger.map((entry, index) => {
                                                    const isCheque = entry.method === 'Check';
                                                    const isPdcPending = isCheque && entry.chequeStatus === 'Pending';

                                                    return (
                                                        <tr key={index} className={`hover:bg-gray-50/50 transition-all ${isPdcPending ? 'bg-amber-50/30' : ''}`}>
                                                            <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                                                                {new Date(entry.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                                                                    {entry.type === 'Invoice' ? `INV-${entry.ref}` : (entry.method === 'Check' ? 'PDC' : entry.method === 'Debit Note' ? 'RETURN' : 'PYMT')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-gray-800">
                                                                        {entry.type === 'Invoice' ? `Purchase Invoice` : (entry.note || 'Account Settlement')}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {isCheque ? (
                                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${entry.chequeStatus === 'Cleared' ? 'bg-green-100 text-green-600' :
                                                                                entry.chequeStatus === 'Bounced' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                                                }`}>
                                                                                Chq #{entry.chequeNumber} • {entry.chequeStatus}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{entry.name || entry.method}</span>
                                                                        )}

                                                                        {isPdcPending && (
                                                                            <div className="flex gap-1 ml-2">
                                                                                <button
                                                                                    onClick={() => handleUpdateCheque(entry.id || entry._id, 'Cleared')}
                                                                                    className="text-[9px] font-bold text-green-600 hover:text-green-700 transition-all"
                                                                                >
                                                                                    Clear
                                                                                </button>
                                                                                <span className="text-gray-300 text-[9px]">|</span>
                                                                                <button
                                                                                    onClick={() => handleUpdateCheque(entry.id || entry._id, 'Bounced')}
                                                                                    className="text-[9px] font-bold text-red-600 hover:text-red-700 transition-all"
                                                                                >
                                                                                    Bounce
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-bold text-red-500 text-right">
                                                                {entry.isCredit ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-bold text-green-600 text-right">
                                                                {!entry.isCredit ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-bold text-gray-900 text-right">
                                                                Rs {entry.runningBalance.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                                            <AlertCircle size={40} />
                                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No transactions recorded</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Voucher #</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKUs</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Value</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {purchaseOrders.length > 0 ? (
                                                purchaseOrders.map((order, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-all">
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                                #{order._id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                                    {order.items?.length || 0}
                                                                </span>
                                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <CheckCircle2 size={12} className="text-green-500" />
                                                                <span className="text-[10px] font-bold uppercase text-green-600 tracking-widest">
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-900 text-right">
                                                            Rs {order.total?.toLocaleString() || 0}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 text-gray-300 hover:text-blue-500 transition-all">
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                                            <AlertCircle size={40} />
                                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No invoices found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end flex-shrink-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                        Dismiss Audit View
                    </button>
                </div>
            </div>

            <RecordPaymentModal
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
                supplier={supplier}
                onSuccess={fetchLedger}
            />

            <PurchaseReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                supplierId={supplier._id}
                supplierName={supplier.name}
                onSuccess={fetchLedger}
            />
        </div>
    );
};

export default DistributorLedgerModal;
