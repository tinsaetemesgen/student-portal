import { useState } from "react";
import { Search, ClipboardCheck, Calendar } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const MyAttendance = () => {
    const { attendanceRecords } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRecords = attendanceRecords.filter((record) =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
    const lateCount = attendanceRecords.filter((r) => r.status === "late").length;
    const totalRecords = attendanceRecords.length;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: "bg-green-100 text-green-700",
            absent: "bg-red-100 text-red-700",
            late: "bg-yellow-100 text-yellow-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
                    <p className="text-gray-500">View your attendance records</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Calendar size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Total Days</p><h2 className="text-2xl font-bold">{totalRecords}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Present</p><h2 className="text-2xl font-bold text-green-600">{presentCount}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-lg text-red-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Absent</p><h2 className="text-2xl font-bold text-red-600">{absentCount}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Late</p><h2 className="text-2xl font-bold text-yellow-600">{lateCount}</h2></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search records..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b"><h2 className="font-semibold text-lg text-gray-800">Attendance Records</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No attendance records available yet.</td></tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.studentName}</td>
                                            <td className="px-6 py-4">{record.grade}</td>
                                            <td className="px-6 py-4 text-gray-600">{record.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(record.status)}`}>{record.status}</span>
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

export default MyAttendance;
