import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Search, Plus, MapPin, Phone, Mail, FileText, ShoppingCart, Users, Wallet, Clock, MoreVertical, AlertTriangle, Building2, Calendar } from 'lucide-react';
import API_URL from '../config/api';
import AddDistributorModal from '../components/suppliers/AddDistributorModal';
import PurchaseOrderModal from '../components/suppliers/PurchaseOrderModal';
import DistributorLedgerModal from '../components/suppliers/DistributorLedgerModal';

const Suppliers = () => {
    const { showToast } = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/suppliers`);
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            showToast('Failed to fetch distributors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const isAccountDead = (lastOrderDate) => {
        if (!lastOrderDate) return false;
        const diffTime = Math.abs(new Date() - new Date(lastOrderDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 90;
    };

    const isCreditOverdue = (supplier) => {
        if (!supplier.lastOrderDate || supplier.totalPayable <= 0) return false;
        const diffTime = Math.abs(new Date() - new Date(supplier.lastOrderDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > (supplier.creditDays || 30);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.parentCompany && s.parentCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: suppliers.length,
        outstanding: suppliers.reduce((acc, s) => acc + (s.totalPayable || 0), 0),
        overdueCount: suppliers.filter(s => isCreditOverdue(s)).length
    };

    const handleAddDistributor = () => {
        setIsAddModalOpen(true);
    };

    const handleOpenOrder = (supplier) => {
        setSelectedSupplier(supplier);
        setIsOrderModalOpen(true);
    };

    const handleOpenLedger = (supplier) => {
        setSelectedSupplier(supplier);
        setIsLedgerModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Distributors Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage pharma suppliers, bonus schemes & PDCs</p>
                </div>
                <button
                    onClick={handleAddDistributor}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Distributor</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Distributors</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <Users size={22} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Outstanding Balance</p>
                        <h3 className="text-2xl font-bold text-gray-800">Rs {stats.outstanding.toLocaleString()}</h3>
                        <p className="text-gray-400 text-[10px] font-semibold mt-1">{suppliers.filter(s => s.totalPayable > 0).length} active balances</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                        <Wallet size={22} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Overdue Payments</p>
                        <h3 className="text-2xl font-bold text-red-500">{stats.overdueCount}</h3>
                        <p className="text-gray-400 text-[10px] font-semibold mt-1">Beyond credit terms</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        <AlertTriangle size={22} />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Name, City, or Parent Company (e.g. GSK)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                />
            </div>

            {/* Distributor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map(supplier => {
                        const dead = isAccountDead(supplier.lastOrderDate);
                        const overdue = isCreditOverdue(supplier);

                        return (
                            <div
                                key={supplier._id}
                                className={`bg-white rounded-2xl border ${overdue ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} shadow-sm p-6 hover:shadow-md transition-all group relative overflow-hidden`}
                            >
                                {dead && (
                                    <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest z-10">
                                        Inactive / Dead Account
                                    </div>
                                )}

                                <button className="absolute right-6 top-6 text-gray-300 hover:text-gray-600">
                                    <MoreVertical size={20} />
                                </button>

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-0.5 pr-6 truncate">{supplier.name}</h3>
                                    {supplier.parentCompany && (
                                        <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                                            <Building2 size={12} />
                                            <span>{supplier.parentCompany}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold mb-6">
                                    <MapPin size={12} className="text-gray-300" />
                                    <span>{supplier.city || 'Location Not Set'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium">
                                            <Phone size={12} className="text-gray-400" />
                                            <span className="truncate">{supplier.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium">
                                            <Mail size={12} className="text-gray-400" />
                                            <span className="truncate">{supplier.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium">
                                            <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">NTN</span>
                                            <span className="truncate">{supplier.ntn || '---'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium">
                                            <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">STRN</span>
                                            <span className="truncate">{supplier.strn || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 pt-6 border-t border-gray-50">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                                                <Calendar size={10} /> Last Order
                                            </span>
                                            <span className="text-gray-600 font-bold text-xs mt-0.5">
                                                {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : 'No orders yet'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Credit Days</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${overdue ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                {supplier.creditDays || 30} Days {overdue && '(Overdue)'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Outstanding</span>
                                        <span className={`font-bold text-xl ${overdue ? 'text-red-500' : 'text-gray-800'}`}>
                                            Rs {supplier.totalPayable?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleOpenOrder(supplier)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <ShoppingCart size={16} />
                                        <span>Create Order</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenLedger(supplier)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <FileText size={16} />
                                        <span>Ledger</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                        <Users size={64} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-gray-600">No distributors found</p>
                        <p className="text-sm">Try adjusting your search or add a new distributor.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddDistributorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchSuppliers}
            />
            {selectedSupplier && (
                <>
                    <PurchaseOrderModal
                        isOpen={isOrderModalOpen}
                        onClose={() => setIsOrderModalOpen(false)}
                        supplier={selectedSupplier}
                    />
                    <DistributorLedgerModal
                        isOpen={isLedgerModalOpen}
                        onClose={() => setIsLedgerModalOpen(false)}
                        supplier={selectedSupplier}
                    />
                </>
            )}
        </div>
    );
};

export default Suppliers;
