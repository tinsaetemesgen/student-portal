import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface FeeStructure {
    _id: string;
    name: string;
    amount: number;
    feeType: string;
    classLevel: string;
    semester: string;
    academicYear: string;
    dueDate: string;
    isActive: boolean;
}

const FinanceFees = () => {
    const [fees, setFees] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        feeType: "tuition",
        classLevel: "secondary",
        semester: "Semester 1",
        academicYear: "2024/25",
        dueDate: "",
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/finance/fee-structures', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFees(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching fees:", error);
            setError(error.response?.data?.error || "Failed to load fees");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:7000/api/finance/fee-structures', {
                ...formData,
                amount: parseFloat(formData.amount),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchFees();
            alert('✅ Fee structure created successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to create fee");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
    };

    if (loading) {
        return (
            <DashboardLayout role="finance_officer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading fee structures...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="finance_officer">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fee Structures</h1>
                        <p className="text-gray-500">Manage school fee structures</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create Fee
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class Level</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Due Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No fee structures created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    fees.map((fee) => (
                                        <tr key={fee._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{fee.name}</td>
                                            <td className="px-4 py-3">{formatCurrency(fee.amount)}</td>
                                            <td className="px-4 py-3 capitalize">{fee.feeType}</td>
                                            <td className="px-4 py-3 capitalize">{fee.classLevel}</td>
                                            <td className="px-4 py-3">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${fee.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {fee.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Create Fee Structure</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Fee Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <select
                                    value={formData.feeType}
                                    onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                >
                                    <option value="tuition">Tuition</option>
                                    <option value="registration">Registration</option>
                                    <option value="activity">Activity</option>
                                    <option value="library">Library</option>
                                    <option value="lab">Lab</option>
                                    <option value="sports">Sports</option>
                                </select>
                                <select
                                    value={formData.classLevel}
                                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                >
                                    <option value="primary">Primary (1-4)</option>
                                    <option value="middle">Middle (5-8)</option>
                                    <option value="secondary">Secondary (9-12)</option>
                                </select>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default FinanceFees;