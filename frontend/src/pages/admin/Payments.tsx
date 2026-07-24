import { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
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

interface FeeFormData {
    feeTitle: string;
    gradeClass: string;
    amount: string;
    dueDate: string;
    academicYear: string;
    description: string;
    feeType: string;
    semester: string;
}

const initialFeeForm: FeeFormData = {
    feeTitle: "",
    gradeClass: "",
    amount: "",
    dueDate: "",
    academicYear: "",
    description: "",
    feeType: "tuition",
    semester: "Semester 1",
};

const Payments = () => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<FeeFormData>(initialFeeForm);
    const [errors, setErrors] = useState<Partial<FeeFormData>>({});
    const modalRef = useRef<HTMLDivElement>(null);

    const [stats, setStats] = useState([
        { title: "Total Revenue", value: "0 ETB" },
        { title: "Outstanding Fees", value: "0 ETB" },
        { title: "Paid Students", value: "0" },
        { title: "Unpaid Students", value: "0" },
    ]);
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeeData();
    }, []);

    const fetchFeeData = async () => {
        try {
            const token = localStorage.getItem('token');

            const feeRes = await axios.get('http://localhost:7000/api/fees/structures', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const reportRes = await axios.get('http://localhost:7000/api/fees/reports/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFeeStructures(feeRes.data.data);

            const report = reportRes.data.data;
            if (report && report.summary) {
                setStats([
                    { title: "Total Revenue", value: `${report.summary.totalAmount || 0} ETB` },
                    { title: "Outstanding Fees", value: `${report.summary.pending?.amount || 0} ETB` },
                    { title: "Paid Students", value: `${report.summary.paid?.count || 0}` },
                    { title: "Unpaid Students", value: `${report.summary.pending?.count || 0}` },
                ]);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching fee data:", error);
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<FeeFormData> = {};
        if (!formData.feeTitle.trim()) newErrors.feeTitle = "Fee Title is required";
        if (!formData.gradeClass.trim()) newErrors.gradeClass = "Grade/Class is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.dueDate.trim()) newErrors.dueDate = "Due Date is required";
        if (!formData.academicYear.trim()) newErrors.academicYear = "Academic Year is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ UPDATED: Creates fee AND assigns to students
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const token = localStorage.getItem('token');

            // 1️⃣ Create fee structure
            const feeData = {
                name: formData.feeTitle,
                description: formData.description,
                amount: parseFloat(formData.amount.replace(/,/g, '')),
                feeType: formData.feeType,
                classLevel: formData.gradeClass,
                semester: formData.semester,
                academicYear: formData.academicYear,
                dueDate: new Date(formData.dueDate).toISOString(),
                isActive: true,
            };

            const feeResponse = await axios.post('http://localhost:7000/api/fees/structures', feeData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newFeeId = feeResponse.data.data._id;
            console.log('✅ Fee structure created:', newFeeId);

            // 2️⃣ Get all students for this class level
            const studentsRes = await axios.get('http://localhost:7000/api/users?role=student', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const classLevelMap: Record<string, string[]> = {
                primary: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
                middle: ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
                secondary: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
            };

            const targetClasses = classLevelMap[formData.gradeClass] || [];
            const students = studentsRes.data.data.filter((student: any) =>
                targetClasses.includes(student.class)
            );

            if (students.length === 0) {
                alert('No students found in this class level. Fee structure created but not assigned.');
                setShowModal(false);
                setFormData(initialFeeForm);
                setErrors({});
                await fetchFeeData();
                return;
            }

            // 3️⃣ Assign fee to all students
            const studentIds = students.map((s: any) => s._id);
            await axios.post('http://localhost:7000/api/fees/assign', {
                feeStructureId: newFeeId,
                studentIds: studentIds,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ Fee assigned to ${students.length} students`);

            // 4️⃣ Refresh data
            await fetchFeeData();
            setShowModal(false);
            setFormData(initialFeeForm);
            setErrors({});
            alert(`✅ Fee created and assigned to ${students.length} students!`);

        } catch (error: any) {
            console.error('❌ Error:', error);
            alert(error.response?.data?.error || 'Failed to create or assign fee');
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData(initialFeeForm);
        setErrors({});
    };

    const modalContent = showModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200"
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Create Fee</h2>
                    <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Fee Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fee Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.feeTitle}
                            onChange={(e) => setFormData({ ...formData, feeTitle: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.feeTitle ? "border-red-400" : ""}`}
                            placeholder="e.g. Tuition Fee"
                        />
                        {errors.feeTitle && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.feeTitle}
                            </p>
                        )}
                    </div>

                    {/* Fee Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fee Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.feeType}
                            onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="tuition">Tuition</option>
                            <option value="registration">Registration</option>
                            <option value="activity">Activity</option>
                            <option value="library">Library</option>
                            <option value="lab">Lab</option>
                            <option value="sports">Sports</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grade Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.gradeClass}
                                onChange={(e) => setFormData({ ...formData, gradeClass: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.gradeClass ? "border-red-400" : ""}`}
                            >
                                <option value="">Select Grade Level</option>
                                <option value="primary">Primary (Grade 1-4)</option>
                                <option value="middle">Middle (Grade 5-8)</option>
                                <option value="secondary">Secondary (Grade 9-12)</option>
                            </select>
                            {errors.gradeClass && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.gradeClass}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (ETB) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? "border-red-400" : ""}`}
                                placeholder="e.g. 15000"
                            />
                            {errors.amount && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.amount}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.dueDate ? "border-red-400" : ""}`}
                            />
                            {errors.dueDate && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.dueDate}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.academicYear ? "border-red-400" : ""}`}
                                placeholder="e.g. 2024/25"
                            />
                            {errors.academicYear && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.academicYear}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes about this fee"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Create & Assign Fee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading fee data...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
                    <p className="text-gray-500">Create, assign, and track school payments from one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-gray-500 text-sm">{stat.title}</p>
                            <h3 className="text-3xl font-bold mt-2 text-gray-800">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-lg font-semibold">Fee Structure</h2>
                                <p className="text-sm text-gray-500">Admin-managed fees and payment status.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                            >
                                + Create Fee
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-gray-500 text-sm">
                                        <th className="pb-3">Fee</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Grade Level</th>
                                        <th className="pb-3">Due Date</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {feeStructures.length > 0 ? (
                                        feeStructures.map((fee) => (
                                            <tr key={fee._id} className="border-b last:border-0">
                                                <td className="py-4 font-medium">{fee.name}</td>
                                                <td className="py-4">{fee.amount} ETB</td>
                                                <td className="py-4 capitalize">{fee.classLevel}</td>
                                                <td className="py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${fee.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {fee.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                No fee structures created yet. Click "Create Fee" to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold">Quick Actions</h2>
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Create fee structures for tuition, library, and exams.</div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Fees are automatically assigned to all students in the selected grade level.</div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Record cash or bank payments and print receipts.</div>
                        </div>
                    </div>
                </div>
            </div>

            {modalContent}
        </DashboardLayout>
    );
};

export default Payments;