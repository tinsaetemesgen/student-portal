import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users, CheckCircle, XCircle, Clock, Plus, Eye } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface RevenueData {
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    paidStudents: number;
    totalStudents: number;
    collectionRate: number;
}

interface PaymentData {
    _id: string;
    studentId: { name: string; email: string; class: string };
    amount: number;
    method: string;
    status: string;
    createdAt: string;
}

const FinanceDashboard = () => {
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [recentPayments, setRecentPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch revenue summary
            const revenueRes = await axios.get('http://localhost:7000/api/finance/revenue', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRevenue(revenueRes.data.data);

            // Fetch recent payments
            const paymentsRes = await axios.get('http://localhost:7000/api/finance/payments?limit=10', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentPayments(paymentsRes.data.data || []);

            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching finance data:", error);
            setError(error.response?.data?.error || "Failed to load data");
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

    const stats = revenue ? [
        { title: "Total Collected", value: formatCurrency(revenue.totalCollected), icon: <DollarSign size={24} className="text-green-600" />, color: "bg-green-50" },
        { title: "Pending Payments", value: formatCurrency(revenue.totalPending), icon: <Clock size={24} className="text-yellow-600" />, color: "bg-yellow-50" },
        { title: "Overdue Fees", value: formatCurrency(revenue.totalOverdue), icon: <XCircle size={24} className="text-red-600" />, color: "bg-red-50" },
        { title: "Collection Rate", value: `${revenue.collectionRate}%`, icon: <TrendingUp size={24} className="text-blue-600" />, color: "bg-blue-50" },
    ] : [];

    if (loading) {
        return (
            <DashboardLayout role="finance_officer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading financial data...</div>
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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
                    <p className="text-gray-500">Manage school fees, payments, and financial reports</p>
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg inline-block">
                        Welcome, Finance Officer! You can view and manage all financial activities here.
                    </div>
                </div>

                {/* Stats Cards */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.title} className={`${stat.color} p-5 rounded-xl shadow-sm flex items-center gap-4`}>
                                <div className="bg-white p-3 rounded-lg shadow-sm">{stat.icon}</div>
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.title}</p>
                                    <h2 className="text-2xl font-bold">{stat.value}</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Fee Management</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-3">
                                <Plus size={18} className="text-blue-600" />
                                <span>Create Fee Structure</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <Users size={18} className="text-gray-600" />
                                <span>Assign Fees to Students</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">💳 Payment Processing</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center gap-3">
                                <CheckCircle size={18} className="text-green-600" />
                                <span>Confirm Payments</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <Eye size={18} className="text-gray-600" />
                                <span>View All Payments</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Reports</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center gap-3">
                                <TrendingUp size={18} className="text-purple-600" />
                                <span>Revenue Report</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3">
                                <TrendingDown size={18} className="text-gray-600" />
                                <span>Expense Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentPayments.slice(0, 10).map((payment) => (
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

export default FinanceDashboard;