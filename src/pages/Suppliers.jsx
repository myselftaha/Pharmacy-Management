import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Search, Plus, MapPin, Phone, Mail, FileText, ShoppingCart, Users, Wallet, Clock, MoreVertical } from 'lucide-react';
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

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: suppliers.length,
        outstanding: suppliers.reduce((acc, s) => acc + (s.totalPayable || 0), 0),
        avgCreditDays: suppliers.length > 0
            ? Math.round(suppliers.reduce((acc, s) => acc + (s.creditDays || 0), 0) / suppliers.length)
            : 0
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
                    <p className="text-gray-500 text-sm mt-1">Manage your medicine suppliers and wholesalers</p>
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
                        <p className="text-gray-400 text-[10px] font-semibold mt-1">{suppliers.filter(s => s.totalPayable > 0).length} distributors</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                        <Wallet size={22} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Avg. Credit Days</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.avgCreditDays}</h3>
                        <p className="text-gray-400 text-[10px] font-semibold mt-1">Across all distributors</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                        <Clock size={22} />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, city, or contact..."
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
                    filteredSuppliers.map(supplier => (
                        <div key={supplier._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group relative">
                            <button className="absolute right-6 top-6 text-gray-300 hover:text-gray-600">
                                <MoreVertical size={20} />
                            </button>

                            <h3 className="text-lg font-bold text-gray-800 mb-1 pr-6">{supplier.name}</h3>
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold mb-6">
                                <MapPin size={12} className="text-gray-300" />
                                <span>{supplier.city || 'Location Not Set'}</span>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Phone size={14} />
                                    </div>
                                    <span>{supplier.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Mail size={14} />
                                    </div>
                                    <span className="truncate">{supplier.email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 pt-6 border-t border-gray-50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Credit Days</span>
                                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[11px] font-bold">{supplier.creditDays || 0} days</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Outstanding</span>
                                    <span className="text-red-500 font-bold text-lg">Rs {supplier.totalPayable?.toLocaleString() || 0}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleOpenOrder(supplier)}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-95"
                                >
                                    <ShoppingCart size={16} />
                                    <span>Order</span>
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
                    ))
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
