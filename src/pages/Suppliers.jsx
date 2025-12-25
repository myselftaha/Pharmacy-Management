import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Phone, Edit2, Trash2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeleteSupplierModal from '../components/suppliers/DeleteSupplierModal';
import AddSupplierModal from '../components/suppliers/AddSupplierModal';
import API_URL from '../config/api';

const Suppliers = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Suppliers state
    const [suppliers, setSuppliers] = useState([]);
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [isDeleteSupplierModalOpen, setIsDeleteSupplierModalOpen] = useState(false);

    // Initial load
    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers`);
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            showToast('Failed to fetch suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupplier = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Supplier added successfully!', 'success');
                setIsAddSupplierModalOpen(false);
                fetchSuppliers();
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to add supplier', 'error');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            showToast('Error adding supplier', 'error');
        }
    };

    const handleEditSupplier = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers/${editingSupplier._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Supplier updated successfully!', 'success');
                setIsEditSupplierModalOpen(false);
                setEditingSupplier(null);
                fetchSuppliers();
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to update supplier', 'error');
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            showToast('Error updating supplier', 'error');
        }
    };

    const handleDeleteSupplier = (supplier) => {
        setSupplierToDelete(supplier);
        setIsDeleteSupplierModalOpen(true);
    };

    const confirmDeleteSupplier = async (deleteStock) => {
        if (!supplierToDelete) return;

        try {
            const response = await fetch(`${API_URL}/api/suppliers/${supplierToDelete._id}?deleteStock=${deleteStock}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                showToast(result.message || 'Supplier deleted successfully!', 'success');
                fetchSuppliers();
                setIsDeleteSupplierModalOpen(false);
                setSupplierToDelete(null);
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to delete supplier', 'error');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            showToast('Error deleting supplier', 'error');
        }
    };

    const openEditSupplierModal = (e, supplier) => {
        e.stopPropagation();
        setEditingSupplier(supplier);
        setIsEditSupplierModalOpen(true);
    };

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredSuppliers = suppliers.filter(supplier => {
        const query = supplierSearchQuery.toLowerCase();
        return (
            supplier.name?.toLowerCase().includes(query) ||
            supplier.contactPerson?.toLowerCase().includes(query) ||
            supplier.phone?.includes(query) ||
            supplier.email?.toLowerCase().includes(query)
        );
    });

    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
        const { key, direction } = sortConfig;
        let valueA = a[key] || '';
        let valueB = b[key] || '';

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Suppliers</h2>
                    <p className="text-sm text-gray-500">
                        Manage your distributors, contacts, and payables.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={supplierSearchQuery}
                            onChange={(e) => setSupplierSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddSupplierModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                        <Plus size={18} />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Supplier Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-lg">Loading suppliers...</td></tr>
                            ) : sortedSuppliers.length > 0 ? (
                                sortedSuppliers.map((supplier) => (
                                    <tr
                                        key={supplier._id}
                                        className="hover:bg-green-50/30 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/suppliers/${supplier._id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{supplier.name}</div>
                                                    <div className="text-xs text-gray-400 font-normal">{supplier.address}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">{supplier.contactPerson || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                                                {supplier.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} className="text-gray-400" /> {supplier.phone}
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">@</span> {supplier.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {supplier.paymentStatus === 'Paid' ? (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                                        ✓ Paid
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
                                                            Due
                                                        </span>
                                                        <span className="text-xs font-bold text-red-600 mt-1">
                                                            Rs. {supplier.dueAmount?.toLocaleString() || '0'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => openEditSupplierModal(e, supplier)}
                                                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                                    title="Edit Supplier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSupplier(supplier);
                                                    }}
                                                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                    title="Delete Supplier"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                <Truck size={40} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">No suppliers found</p>
                                                <p className="text-sm">Add a new supplier to get started.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            <AddSupplierModal
                isOpen={isAddSupplierModalOpen}
                onClose={() => setIsAddSupplierModalOpen(false)}
                onConfirm={handleAddSupplier}
            />

            <AddSupplierModal
                isOpen={isEditSupplierModalOpen}
                onClose={() => {
                    setIsEditSupplierModalOpen(false);
                    setEditingSupplier(null);
                }}
                onConfirm={handleEditSupplier}
                initialData={editingSupplier}
                isEditMode={true}
            />

            <DeleteSupplierModal
                isOpen={isDeleteSupplierModalOpen}
                onClose={() => setIsDeleteSupplierModalOpen(false)}
                onConfirm={confirmDeleteSupplier}
                supplierName={supplierToDelete?.name}
            />
        </div>
    );
};

export default Suppliers;
