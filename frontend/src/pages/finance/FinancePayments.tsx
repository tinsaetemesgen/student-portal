import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Payment {
    _id: string;
    studentId: { name: string; email: string; class: string };
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    confirmedBy?: { name: string };
}

const FinancePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/finance/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching payments:", error);
            setError(error.response?.data?.error || "Failed to load payments");
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    const handleConfirm = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:7000/api/finance/payments/${id}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
            alert('✅ Payment confirmed successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to confirm payment");
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Reason for rejection:");
        if (reason === null) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:7000/api/finance/payments/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
            alert('❌ Payment rejected');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to reject payment");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="finance_officer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading payments...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="finance_officer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="finance_officer">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
                    <p className="text-gray-500">View and process all student payments</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <h2 className="text-2xl font-bold text-yellow-600">
                            {payments.filter(p => p.status === 'pending').length}
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm">Confirmed</p>
                        <h2 className="text-2xl font-bold text-green-600">
                            {payments.filter(p => p.status === 'confirmed').length}
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                        <p className="text-gray-500 text-sm">Failed</p>
                        <h2 className="text-2xl font-bold text-red-600">
                            {payments.filter(p => p.status === 'failed').length}
                        </h2>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{payment.studentId?.name || 'Unknown'}</td>
                                            <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                                            <td className="px-4 py-3 capitalize">{payment.method}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleConfirm(payment._id)}
                                                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(payment._id)}
                                                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinancePayments;