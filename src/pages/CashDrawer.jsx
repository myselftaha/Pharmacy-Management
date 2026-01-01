import React, { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    History,
    Plus,
    Lock,
    Unlock,
    AlertCircle,
    Calendar,
    Save,
    CheckCircle2,
    DollarSign
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const CashDrawer = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [drawerStatus, setDrawerStatus] = useState(null); // 'Open', 'Closed', or null
    const [drawerData, setDrawerData] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Form States
    const [openingBalance, setOpeningBalance] = useState('');
    const [actualCash, setActualCash] = useState('');
    const [notes, setNotes] = useState('');
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        category: 'Shop Expense',
        description: ''
    });

    const categories = ['Shop Expense', 'Staff Advance', 'Utility Bill', 'Supplier Payment', 'Other'];

    useEffect(() => {
        fetchDrawerStatus();
        fetchHistory();
    }, [selectedDate]);

    const fetchDrawerStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/cash-drawer/status?date=${selectedDate}`);
            const data = await response.json();
            if (response.ok && data) {
                setDrawerData(data);
                setDrawerStatus(data.status);
            } else {
                setDrawerData(null);
                setDrawerStatus(null);
            }
        } catch (error) {
            console.error('Error fetching drawer status:', error);
            showToast('Failed to fetch drawer status', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cash-drawer/history`);
            const data = await response.json();
            if (response.ok) setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleOpenDrawer = async () => {
        if (!openingBalance || isNaN(openingBalance)) {
            showToast('Please enter a valid opening balance', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/cash-drawer/open`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    openingBalance: parseFloat(openingBalance),
                    processedBy: localStorage.getItem('username') || 'Admin'
                })
            });

            if (response.ok) {
                showToast('Cash drawer opened successfully', 'success');
                fetchDrawerStatus();
            } else {
                const err = await response.json();
                showToast(err.message || 'Failed to open drawer', 'error');
            }
        } catch (error) {
            showToast('Connection error', 'error');
        }
    };

    const handleCloseDrawer = async () => {
        if (!actualCash || isNaN(actualCash)) {
            showToast('Please enter the physical cash count', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/cash-drawer/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    actualCash: parseFloat(actualCash),
                    notes
                })
            });

            if (response.ok) {
                showToast('Cash drawer closed and reconciled', 'success');
                fetchDrawerStatus();
                fetchHistory();
            } else {
                const err = await response.json();
                showToast(err.message || 'Failed to close drawer', 'error');
            }
        } catch (error) {
            showToast('Connection error', 'error');
        }
    };

    const handleAddExpense = async () => {
        if (!expenseForm.amount || isNaN(expenseForm.amount)) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...expenseForm,
                    amount: parseFloat(expenseForm.amount),
                    date: selectedDate,
                    paymentMethod: 'Cash',
                    recordedBy: localStorage.getItem('username') || 'Admin'
                })
            });

            if (response.ok) {
                showToast('Expense added successfully', 'success');
                setExpenseForm({ amount: '', category: 'Shop Expense', description: '' });
                fetchDrawerStatus(); // Refresh totals
            } else {
                showToast('Failed to add expense', 'error');
            }
        } catch (error) {
            showToast('Connection error', 'error');
        }
    };

    const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, iconBgClass, urdu }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-start z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        {urdu && <span className="text-[10px] italic text-gray-400 font-medium">({urdu})</span>}
                    </div>
                    <h3 className={`text-2xl font-bold ${colorClass || 'text-gray-800'}`}>{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBgClass}`}>
                    <Icon className={colorClass || 'text-gray-600'} size={22} />
                </div>
            </div>
            {subtext && (
                <div className="text-[11px] text-gray-400 mt-2 z-10 flex items-center gap-1 font-medium italic">
                    {subtext}
                </div>
            )}
            <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5 ${iconBgClass}`}></div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c950]"></div>
            </div>
        );
    }

    return (
        <div className="pb-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cash Drawer</h1>
                    <p className="text-sm text-gray-500">Daily cash reconciliation & shift management</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                    <Calendar className="text-gray-400" size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none focus:ring-0 text-sm font-bold text-gray-700 bg-transparent cursor-pointer"
                    />
                </div>
            </div>

            {/* Status Banner */}
            {!drawerStatus && selectedDate === new Date().toISOString().split('T')[0] && (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="bg-amber-50 p-5 rounded-2xl text-amber-500">
                        <Unlock size={40} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Open Your Drawer</h3>
                        <p className="text-gray-500 text-sm">Enter the starting cash balance to begin tracking today's transactions.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-56">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#00c950]/20 font-bold transition-all"
                            />
                        </div>
                        <button
                            onClick={handleOpenDrawer}
                            className="px-8 py-3.5 bg-[#00c950] hover:brightness-95 text-white rounded-xl font-bold transition-all shadow-lg shadow-[#00c950]/20 whitespace-nowrap active:scale-95"
                        >
                            Start Day
                        </button>
                    </div>
                </div>
            )}

            {drawerStatus === 'Closed' && (
                <div className="bg-gray-100/50 border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="bg-gray-200 p-2 rounded-lg text-gray-500">
                        <Lock size={18} />
                    </div>
                    <p className="text-sm font-bold text-gray-600">This drawer was closed on {new Date(drawerData.closedAt).toLocaleString()}</p>
                </div>
            )}

            {/* Main Stats Summary */}
            {drawerData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Opening Balance"
                        urdu="Ibtidai"
                        value={`Rs. ${drawerData.openingBalance.toLocaleString()}`}
                        icon={Wallet}
                        iconBgClass="bg-blue-50"
                        colorClass="text-blue-600"
                    />
                    <MetricCard
                        title="Cash Sales"
                        urdu="Munaah"
                        value={`+ Rs. ${drawerData.cashSales.toLocaleString()}`}
                        icon={ArrowUpCircle}
                        iconBgClass="bg-emerald-50"
                        colorClass="text-emerald-600"
                        subtext="Fetched from POS sales"
                    />
                    <MetricCard
                        title="Cash Expenses"
                        urdu="Kharcha"
                        value={`- Rs. ${drawerData.cashExpenses.toLocaleString()}`}
                        icon={ArrowDownCircle}
                        iconBgClass="bg-rose-50"
                        colorClass="text-rose-600"
                        subtext="Withdrawals & payments"
                    />
                    <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden flex flex-col justify-between h-36 ${drawerData.status === 'Open' ? 'bg-[#00c950] border-[#00c950] text-white shadow-[#00c950]/20' : 'bg-gray-800 border-gray-800 text-white'}`}>
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium opacity-80">Expected Cash</p>
                                    <span className="text-[10px] italic opacity-60 font-medium">(Matlooba)</span>
                                </div>
                                <h3 className="text-2xl font-bold">Rs. {drawerData.expectedCash.toLocaleString()}</h3>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/20">
                                <TrendingUp className="text-white" size={22} />
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white"></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {drawerStatus === 'Open' && (
                        <>
                            {/* Expense Logging */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Log Expense</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Category</label>
                                        <select
                                            value={expenseForm.category}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                            className="w-full p-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500/10 font-medium transition-all"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={expenseForm.amount}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500/10 font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Description</label>
                                        <input
                                            type="text"
                                            placeholder="What for?"
                                            value={expenseForm.description}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            className="w-full p-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500/10 font-medium transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddExpense}
                                        className="px-8 py-3 bg-rose-500 hover:brightness-95 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
                                    >
                                        Add Expense
                                        <ArrowDownCircle size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Closing Tool */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-gray-50 opacity-50 pointer-events-none">
                                    <DollarSign size={160} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Reconciliation</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm text-sm font-medium">Count your physical cash to close the shift.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Physical Cash Count</label>
                                                    <span className="text-[10px] italic text-gray-300 font-medium">(Mojooda Raqam)</span>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00c950] font-bold text-2xl">Rs.</span>
                                                    <input
                                                        type="number"
                                                        value={actualCash}
                                                        onChange={(e) => setActualCash(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-gray-50 border-none rounded-2xl py-6 pl-16 pr-6 text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-[#00c950]/10 transition-all placeholder:text-gray-200"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Shift Notes</label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Reason for discrepancy or other notes..."
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c950]/10 transition-all h-28 font-medium placeholder:text-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-6 border-b border-gray-200/50 pb-4">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Difference Report</span>
                                                {actualCash && (
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${Math.abs(parseFloat(actualCash) - drawerData.expectedCash) < 0.01 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {Math.abs(parseFloat(actualCash) - drawerData.expectedCash) < 0.01 ? 'Balanced' : 'Discrepancy'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-4 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Expected Total:</span>
                                                    <span className="font-bold text-gray-700">Rs. {drawerData.expectedCash.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Actual Count:</span>
                                                    <span className="font-bold text-gray-700">Rs. {actualCash ? parseFloat(actualCash).toLocaleString() : '0'}</span>
                                                </div>
                                                <div className="flex justify-between pt-4 border-t border-gray-200/50">
                                                    <span className="font-bold text-gray-800 text-sm">Difference:</span>
                                                    <span className={`text-xl font-bold ${(Math.abs(parseFloat(actualCash || 0) - drawerData.expectedCash) < 0.01) ? 'text-gray-400' : (parseFloat(actualCash) - drawerData.expectedCash > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
                                                        {actualCash ? (parseFloat(actualCash) - drawerData.expectedCash > 0 ? '+' : '') + (parseFloat(actualCash) - drawerData.expectedCash).toLocaleString() : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCloseDrawer}
                                                className="w-full py-4 bg-[#00c950] hover:brightness-95 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#00c950]/20 active:scale[0.98]"
                                            >
                                                Close Shift
                                                <Save size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {drawerStatus === 'Closed' && (
                        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="bg-emerald-50 p-6 rounded-full text-[#00c950] mb-6">
                                <CheckCircle2 size={56} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Shift Reconciled</h2>
                            <p className="text-gray-500 max-w-sm mb-10 text-sm font-medium">Daily reconcile for <b>{selectedDate}</b> is completed.</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-lg p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Expected</span>
                                    <span className="text-lg font-bold text-gray-700">Rs. {drawerData.expectedCash.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Actual</span>
                                    <span className="text-lg font-bold text-gray-700">Rs. {drawerData.actualCash.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Difference</span>
                                    <div className={`text-lg font-bold ${drawerData.difference === 0 ? 'text-emerald-600' : (drawerData.difference > 0 ? 'text-emerald-600' : 'text-rose-600')}`}>
                                        {drawerData.difference > 0 ? '+' : ''}{drawerData.difference.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder if no data for date */}
                    {!drawerData && selectedDate !== new Date().toISOString().split('T')[0] && (
                        <div className="bg-white p-24 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-50 p-6 rounded-2xl text-gray-200 mb-5">
                                <History size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 mb-1">No Entries Found</h3>
                            <p className="text-gray-300 text-sm italic">The drawer was not opened on this date.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-[#00c950]" />
                                <h3 className="font-bold text-gray-800">Recent History</h3>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[600px] p-2 custom-scrollbar">
                            <div className="space-y-2">
                                {history.map((h) => (
                                    <button
                                        key={h._id}
                                        onClick={() => setSelectedDate(h.date)}
                                        className={`w-full p-4 rounded-xl text-left border border-transparent transition-all hover:bg-gray-50 flex justify-between items-center group ${selectedDate === h.date ? 'bg-gray-100 border-gray-200' : ''}`}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-700">{h.date === new Date().toISOString().split('T')[0] ? 'Today' : h.date}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Difference: Rs. {h.difference || 0}</div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${h.status === 'Open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {h.status}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CashDrawer;
