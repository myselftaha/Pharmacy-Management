import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SupplyTable from '../components/supplies/SupplyTable';
import AddMedicineModal from '../components/supplies/AddMedicineModal';
import EditSupplyModal from '../components/supplies/EditSupplyModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import API_URL from '../config/api';

const Medicines = () => {
    const { showToast } = useToast();
    const location = useLocation();

    // Medicines state
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [medicineToDelete, setMedicineToDelete] = useState(null);
    const [preSelectedSupplier, setPreSelectedSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        fetchMedicines();
        fetchSuppliers();

        // Handle pre-selected supplier from SupplierDetails
        if (location.state?.supplierId) {
            setPreSelectedSupplier({
                id: location.state.supplierId,
                name: location.state.supplierName
            });
            setIsAddModalOpen(true);
            window.history.replaceState({}, document.title);
        }

        if (location.state?.openAddSupply) {
            setIsAddModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/supplies`);
            if (response.ok) {
                const data = await response.json();
                setMedicines(data);
            } else {
                showToast('Failed to fetch medicines', 'error');
            }
        } catch (error) {
            console.error('Error fetching medicines:', error);
            showToast('Error fetching medicines', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/suppliers`);
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const handleSaveMedicine = async (medicineData) => {
        try {
            const response = await fetch(`${API_URL}/api/supplies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicineData)
            });

            if (response.ok) {
                await fetchMedicines();
                setIsAddModalOpen(false);
                setPreSelectedSupplier(null);
                showToast('Medicine added successfully!', 'success');
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to add medicine', 'error');
            }
        } catch (error) {
            console.error('Error saving medicine:', error);
            showToast('Error saving medicine', 'error');
        }
    };

    const handleEditMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setIsEditModalOpen(true);
    };

    const handleUpdateMedicine = async (updatedData) => {
        try {
            const response = await fetch(`${API_URL}/api/supplies/${selectedMedicine._id || selectedMedicine.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                await fetchMedicines();
                setIsEditModalOpen(false);
                setSelectedMedicine(null);
                showToast('Medicine updated successfully!', 'success');
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to update medicine', 'error');
            }
        } catch (error) {
            console.error('Error updating medicine:', error);
            showToast('Error updating medicine', 'error');
        }
    };

    const handleDeleteClick = (medicine) => {
        setMedicineToDelete(medicine);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!medicineToDelete) return;

        try {
            const medicineId = medicineToDelete._id || medicineToDelete.id;
            const response = await fetch(`${API_URL}/api/supplies/${medicineId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchMedicines();
                setIsDeleteModalOpen(false);
                setMedicineToDelete(null);
                showToast('Medicine deleted successfully!', 'success');
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to delete medicine', 'error');
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            showToast('Error deleting medicine', 'error');
        }
    };

    const filteredMedicines = medicines.filter(medicine => {
        const query = searchQuery.toLowerCase();
        return (
            medicine.name?.toLowerCase().includes(query) ||
            medicine.batchNumber?.toLowerCase().includes(query) ||
            medicine.supplierName?.toLowerCase().includes(query) ||
            medicine.purchaseInvoiceNumber?.toLowerCase().includes(query) ||
            medicine.formulaCode?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Medicines</h2>
                    <p className="text-sm text-gray-500">
                        Manage medicine supplies, batches, and purchase history.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                        <Plus size={18} />
                        <span>Add Medicine</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SupplyTable
                    supplies={filteredMedicines}
                    onEdit={handleEditMedicine}
                    onDelete={(id) => {
                        const medicine = medicines.find(m => (m._id === id) || (m.id === id));
                        if (medicine) handleDeleteClick(medicine);
                    }}
                    isLoading={loading}
                />
            </div>

            {/* MODALS */}
            <AddMedicineModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setPreSelectedSupplier(null);
                }}
                onSave={handleSaveMedicine}
                suppliers={suppliers}
                initialSupplier={preSelectedSupplier}
            />

            <EditSupplyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateMedicine}
                supply={selectedMedicine}
                suppliers={suppliers}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={medicineToDelete?.name}
            />
        </div>
    );
};

export default Medicines;
