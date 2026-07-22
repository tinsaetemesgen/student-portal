import { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";

const financeStats = [
    { title: "Total Revenue", value: "420,000 ETB" },
    { title: "Outstanding Fees", value: "89,000 ETB" },
    { title: "Paid Students", value: "312" },
    { title: "Unpaid Students", value: "47" },
];

const feeStructures = [
    { title: "Tuition", amount: "15,000 ETB", grade: "Grade 9", dueDate: "Sept 30", assigned: "120" },
    { title: "Library", amount: "500 ETB", grade: "All Grades", dueDate: "Sept 15", assigned: "320" },
    { title: "Exam Fee", amount: "2,800 ETB", grade: "Grade 12", dueDate: "Oct 5", assigned: "95" },
];

interface FeeFormData {
    feeTitle: string;
    gradeClass: string;
    amount: string;
    dueDate: string;
    academicYear: string;
    description: string;
}

const initialFeeForm: FeeFormData = {
    feeTitle: "",
    gradeClass: "",
    amount: "",
    dueDate: "",
    academicYear: "",
    description: "",
};

const AdminPayments = () => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<FeeFormData>(initialFeeForm);
    const [errors, setErrors] = useState<Partial<FeeFormData>>({});
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowModal(false);
        };
        if (showModal) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [showModal]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            console.log("New Fee:", formData);
            setShowModal(false);
            setFormData(initialFeeForm);
            setErrors({});
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grade/Class <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.gradeClass}
                                onChange={(e) => setFormData({ ...formData, gradeClass: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.gradeClass ? "border-red-400" : ""}`}
                                placeholder="e.g. Grade 10A"
                            />
                            {errors.gradeClass && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.gradeClass}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? "border-red-400" : ""}`}
                                placeholder="e.g. 15000 ETB"
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
                                placeholder="e.g. 2024/2025"
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
                            Create Fee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
                    <p className="text-gray-500">Create, assign, and track school payments from one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {financeStats.map((stat) => (
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
                                        <th className="pb-3">Grade</th>
                                        <th className="pb-3">Due Date</th>
                                        <th className="pb-3">Assigned</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {feeStructures.map((fee) => (
                                        <tr key={fee.title} className="border-b last:border-0">
                                            <td className="py-4 font-medium">{fee.title}</td>
                                            <td className="py-4">{fee.amount}</td>
                                            <td className="py-4">{fee.grade}</td>
                                            <td className="py-4">{fee.dueDate}</td>
                                            <td className="py-4">{fee.assigned} students</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold">Quick Actions</h2>
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Create fee structures for tuition, library, and exams.</div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Assign fees to grade levels, classes, or individual students.</div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">Record cash or bank payments and print receipts.</div>
                        </div>
                    </div>
                </div>
            </div>

            {modalContent}
        </DashboardLayout>
    );
};

export default AdminPayments;
