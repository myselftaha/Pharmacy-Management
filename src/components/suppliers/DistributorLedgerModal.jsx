import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ChevronRight } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';
import RecordPaymentModal from './RecordPaymentModal';

const DistributorLedgerModal = ({ isOpen, onClose, supplier }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('ledger');
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Distributor Ledger</h2>
                        <p className="text-gray-500 text-xs mt-1">Financial history and audit trail for {supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ArrowUpRight size={12} className="text-red-500" />
                                Total Purchases
                            </p>
                            <h3 className="text-xl font-bold text-red-500">Rs {ledgerData?.stats?.totalPurchased?.toLocaleString() || 0}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ArrowDownLeft size={12} className="text-green-500" />
                                Total Payments
                            </p>
                            <h3 className="text-xl font-bold text-green-500">Rs {ledgerData?.stats?.totalPaid?.toLocaleString() || 0}</h3>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Wallet size={12} className="text-amber-500" />
                                Current Balance
                            </p>
                            <h3 className="text-xl font-bold text-amber-500">Rs {ledgerData?.stats?.balance?.toLocaleString() || 0}</h3>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        {/* Tabs */}
                        <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('ledger')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ledger' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Ledger Entries
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Purchase Orders
                            </button>
                        </div>

                        {/* Record Payment Button */}
                        <button
                            onClick={() => setIsRecordPaymentOpen(true)}
                            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-sm active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Record Payment</span>
                        </button>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {activeTab === 'ledger' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Debit</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Credit</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {ledgerData?.ledger?.length > 0 ? (
                                                ledgerData.ledger.map((entry, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                                            {new Date(entry.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {entry.type === 'Invoice' ? (
                                                                    <ArrowUpRight size={14} className="text-red-500" />
                                                                ) : (
                                                                    <ArrowDownLeft size={14} className="text-green-500" />
                                                                )}
                                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${entry.type === 'Invoice' ? 'text-red-500' : 'text-green-500'}`}>
                                                                    {entry.type}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-800">
                                                                    {entry.type === 'Invoice' ? `Invoice #${entry.ref}` : (entry.note || 'Cash Payment')}
                                                                </span>
                                                                {entry.type === 'Invoice' && (
                                                                    <span className="text-[10px] font-semibold text-gray-400">{entry.name} ({entry.quantity} items)</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-red-500 text-right">
                                                            {entry.isCredit ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-green-500 text-right">
                                                            {!entry.isCredit ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                                            Rs {entry.runningBalance.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold">
                                                        No ledger entries found.
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
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {purchaseOrders.length > 0 ? (
                                                purchaseOrders.map((order, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-tighter">
                                                            #{order._id.slice(-6)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                                            {order.items?.length || 0} Products
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                                            {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                                        'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                                            Rs {order.total?.toLocaleString() || 0}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-1.5 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-20 text-center text-gray-400 font-bold">
                                                        No purchase orders found.
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
                        className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm transition-all hover:bg-gray-800 active:scale-95 shadow-sm"
                    >
                        Close Ledger
                    </button>
                </div>
            </div>

            <RecordPaymentModal
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
                supplier={supplier}
                onSuccess={fetchLedger}
            />
        </div>
    );
};

export default DistributorLedgerModal;
