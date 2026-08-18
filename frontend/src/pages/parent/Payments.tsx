// src/pages/parent/ParentPayments.tsx - COMPLETE WITH SAFE RENDERING

import { useState, useEffect } from "react";
import { X, Check, Upload, Download, AlertCircle, Banknote, Users, Plus, FileText } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface Child {
    _id: string;
    name: string;
    class: string;
    classLevel?: string;
}

interface Payment {
    _id: string;
    studentId: {
        _id: string;
        name: string;
        class: string;
    };
    studentFeeId: {
        feeName: string;
        amount: number;
    };
    amount: number;
    bankName: string;
    referenceNumber: string;
    screenshotUrl: string;
    status: string;
    receiptNumber: string;
    receiptUrl: string;
    rejectionReason: string;
    confirmedBy: {
        name: string;
    };
    createdAt: string;
    confirmedAt: string;
}

interface StudentFee {
    _id: string;
    feeName: string;
    amount: number;
    status: string;
    dueDate: string;
    startDate?: string;
    endDate?: string;
    lateFeeAmount?: number;
    gracePeriodDays?: number;
    isOverdue?: boolean;
    totalAmount?: number;
    isLateFeeApplied?: boolean;
}

const SCHOOL_BANK = {
    bankName: "Commercial Bank of Ethiopia",
    accountName: "Adama Science and Technology University",
    accountNumber: "1000123456789",
    branch: "Adama Main Branch",
};

const BANK_OPTIONS = [
    { id: "CBE", name: "Commercial Bank of Ethiopia" },
    { id: "Abysina", name: "Abysina Bank" },
    { id: "Dashen", name: "Dashen Bank" },
    { id: "Coop", name: "Cooperative Bank" },
    { id: "Wegagan", name: "Wegagan Bank" },
    { id: "Other", name: "Other" },
];

const ParentPayments = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>("");
    const [payments, setPayments] = useState<Payment[]>([]);
    const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        studentFeeId: "",
        bankName: "CBE",
        referenceNumber: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
    });
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        async function fetchParentData() {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user?._id;

                if (!userId) {
                    setError("User not found");
                    setLoading(false);
                    return;
                }

                const childrenRes = await axios.get(
                    `https://kamara-school-backend.onrender.com/api/parents/${userId}/children`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const childrenData = childrenRes.data.data || [];
                setChildren(childrenData);

                if (childrenData.length > 0) {
                    setSelectedChild(childrenData[0]._id);
                }

                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching parent data:", error);
                setError(getApiErrorMessage(error, "Failed to load data"));
                setLoading(false);
            }
        }

        fetchParentData();
    }, []);

    const fetchChildFees = async (childId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `https://kamara-school-backend.onrender.com/api/finance/parent/student-fees?studentId=${childId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const fees: StudentFee[] = response.data.data || [];
            setStudentFees(fees);

            const pendingFee = fees.find((f) => f.status !== 'paid');
            if (pendingFee) {
                setFormData(prev => ({
                    ...prev,
                    studentFeeId: pendingFee._id,
                    amount: pendingFee.amount.toString(),
                }));
            }
        } catch (error) {
            console.error("❌ Error fetching child fees:", error);
            setError(getApiErrorMessage(error, "Failed to load fees"));
        }
    };

    const fetchChildPayments = async (childId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `https://kamara-school-backend.onrender.com/api/finance/parent/payments?studentId=${childId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPayments(response.data.data || []);
        } catch (error) {
            console.error("❌ Error fetching child payments:", error);
        }
    };

    useEffect(() => {
        async function loadChildData() {
            if (selectedChild) {
                console.log('🔄 Selected child changed:', selectedChild);
                await fetchChildFees(selectedChild);
                await fetchChildPayments(selectedChild);
            }
        }

        loadChildData();
    }, [selectedChild]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setModalError("Please upload a JPEG, PNG, or WEBP image.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setModalError("File size must be less than 5MB.");
                return;
            }

            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setModalError("");
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError("");
        setSuccess(false);

        if (!screenshot) {
            setModalError("Please upload a screenshot of the payment");
            setSubmitting(false);
            return;
        }

        if (!formData.studentFeeId) {
            setModalError("Please select a fee to pay");
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('studentFeeId', formData.studentFeeId);
            formDataToSend.append('bankName', formData.bankName);
            formDataToSend.append('referenceNumber', formData.referenceNumber);
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('paymentDate', formData.paymentDate);
            formDataToSend.append('screenshot', screenshot);

            await axios.post(
                'https://kamara-school-backend.onrender.com/api/payments/submit',
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setSuccess(true);
            setSuccessMessage("Payment submitted successfully!");
            setShowModal(false);
            resetPaymentForm();

            if (selectedChild) {
                await fetchChildPayments(selectedChild);
                await fetchChildFees(selectedChild);
            }

            setTimeout(() => {
                setSuccess(false);
                setSuccessMessage("");
            }, 5000);

        } catch (err) {
            const errorMsg = getApiErrorMessage(err, "Failed to submit payment");
            setModalError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const resetPaymentForm = () => {
        setFormData({
            studentFeeId: formData.studentFeeId,
            bankName: "CBE",
            referenceNumber: "",
            amount: formData.amount,
            paymentDate: new Date().toISOString().split("T")[0],
        });
        setScreenshot(null);
        setScreenshotPreview(null);
        setModalError("");
    };

    // ✅ RECEIPT DOWNLOAD
    const downloadReceipt = async (paymentId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `https://kamara-school-backend.onrender.com/api/finance/payments/${paymentId}/receipt`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading receipt:", error);
            alert(getApiErrorMessage(error, "Failed to download receipt"));
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            failed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        };
        return styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <Check size={16} className="text-green-600" />;
            case 'pending': return <AlertCircle size={16} className="text-yellow-600" />;
            case 'rejected': return <X size={16} className="text-red-600" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading payments...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (children.length === 0) {
        return (
            <DashboardLayout role="parent">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payments</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage your children's school fees</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">No Children Linked</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Please contact the school registrar to link your children.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ✅ Safe calculation with fallbacks
    const totalOutstanding = Array.isArray(studentFees)
        ? studentFees
            .filter(fee => fee?.status !== 'paid')
            .reduce((sum, fee) => sum + (fee?.totalAmount || fee?.amount || 0), 0)
        : 0;

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400 flex items-center gap-3">
                        <Check size={24} />
                        <div>
                            <p className="font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Outstanding Balance</h1>
                            <p className="text-gray-500 dark:text-gray-400">Review your child's current school dues.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                            <Plus size={18} /> Pay Now
                        </button>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Child</label>
                        <div className="flex flex-wrap gap-2">
                            {children.map((child) => (
                                <button
                                    key={child._id}
                                    onClick={() => setSelectedChild(child._id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        selectedChild === child._id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {child.name} ({child.class || 'No Class'})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        {!Array.isArray(studentFees) || studentFees.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Check size={48} className="mx-auto text-green-300 mb-2" />
                                <p>No fees assigned to this child.</p>
                            </div>
                        ) : studentFees.filter(f => f?.status !== 'paid').length === 0 ? (
                            <div className="text-center py-8 text-green-600 dark:text-green-400">
                                <Check size={48} className="mx-auto text-green-300 mb-2" />
                                <p>🎉 All fees are paid for this child!</p>
                            </div>
                        ) : (
                            studentFees
                                .filter(fee => fee?.status !== 'paid')
                                .map((fee) => (
                                    <div key={fee._id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{fee.feeName || 'Unknown Fee'}</span>
                                            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${fee.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                {fee.status || 'pending'}
                                            </span>
                                            {fee.isOverdue && (
                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                    ⚠️ Late Fee: {fee.lateFeeAmount || 0} ETB
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {fee.totalAmount || fee.amount || 0} ETB
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>

                    {Array.isArray(studentFees) && studentFees.filter(f => f?.status !== 'paid').length > 0 && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Due</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalOutstanding} ETB</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
                        <FileText size={20} /> Payment History
                    </h2>

                    {!Array.isArray(payments) || payments.length === 0 ? (
                        <div className="mt-4 text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No payment records found for this child.</p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {payments.slice(0, 10).map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{payment.studentFeeId?.feeName || 'N/A'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {payment.bankName || 'N/A'} • {payment.referenceNumber || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{payment.amount || 0} ETB</p>
                                        <p className={`text-sm flex items-center gap-1 justify-end ${getStatusBadge(payment.status || 'pending')} px-2 py-0.5 rounded-full`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Pending'}
                                        </p>
                                        {payment.receiptNumber && payment.status === 'confirmed' && (
                                            <button
                                                onClick={() => downloadReceipt(payment._id)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                                            >
                                                <Download size={12} /> Download Receipt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Keep as is */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Submit Payment</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                                    <Banknote size={18} /> Transfer to School Account
                                </p>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                    <p><span className="font-medium">Bank:</span> {SCHOOL_BANK.bankName}</p>
                                    <p><span className="font-medium">Account Name:</span> {SCHOOL_BANK.accountName}</p>
                                    <p><span className="font-medium">Account Number:</span> {SCHOOL_BANK.accountNumber}</p>
                                    <p><span className="font-medium">Branch:</span> {SCHOOL_BANK.branch}</p>
                                </div>
                            </div>

                            {modalError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                                    <X size={18} />
                                    <span>{modalError}</span>
                                </div>
                            )}

                            {children.length > 1 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Child</label>
                                    <select
                                        value={selectedChild}
                                        onChange={(e) => setSelectedChild(e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                        required
                                    >
                                        {children.map((child) => (
                                            <option key={child._id} value={child._id}>
                                                {child.name} ({child.class || 'No Class'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Fee</label>
                                <select
                                    value={formData.studentFeeId}
                                    onChange={(e) => {
                                        const fee = studentFees.find(f => f._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            studentFeeId: e.target.value,
                                            amount: fee ? fee.amount.toString() : "",
                                        });
                                    }}
                                    className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                    required
                                >
                                    <option value="">Select a fee</option>
                                    {studentFees.map((fee) => (
                                        <option key={fee._id} value={fee._id}>
                                            {fee.feeName} - {fee.amount} ETB ({fee.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bank</label>
                                    <select
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                    >
                                        {BANK_OPTIONS.map((bank) => (
                                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Reference Number</label>
                                    <input
                                        type="text"
                                        value={formData.referenceNumber}
                                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                        placeholder="e.g., CBE2026001"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Amount (ETB)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Upload Payment Screenshot</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="screenshot-upload"
                                    />
                                    <label htmlFor="screenshot-upload" className="cursor-pointer block">
                                        {screenshotPreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={screenshotPreview}
                                                    alt="Screenshot"
                                                    className="max-h-32 mx-auto rounded-lg"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 py-4">
                                                <Upload size={32} className="mx-auto text-gray-400 dark:text-gray-500" />
                                                <p className="text-gray-500 dark:text-gray-400">Click to upload screenshot</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WEBP (Max 5MB)</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-4 py-2 rounded-lg transition font-medium ${
                                        submitting
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ParentPayments;