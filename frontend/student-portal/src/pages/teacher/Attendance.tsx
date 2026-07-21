import { useState } from "react";
import { Search, Plus, X, ClipboardCheck } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

interface AttendanceForm {
    studentName: string;
    date: string;
    status: "present" | "absent" | "late";
    grade: string;
}

const Attendance = () => {
    const { attendanceRecords, addAttendanceRecord } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState<AttendanceForm>({
        studentName: "",
        date: new Date().toISOString().split("T")[0],
        status: "present",
        grade: "",
    });

    const filteredRecords = attendanceRecords.filter((record) =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
    const lateCount = attendanceRecords.filter((r) => r.status === "late").length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addAttendanceRecord({ id: Date.now(), ...formData });
        setShowModal(false);
        setFormData({
            studentName: "",
            date: new Date().toISOString().split("T")[0],
            status: "present",
            grade: "",
        });
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: "bg-green-100 text-green-700",
            absent: "bg-red-100 text-red-700",
            late: "bg-yellow-100 text-yellow-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold">Mark Attendance</h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                        <input type="text" required value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
                            <input type="text" required value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Grade 10A" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" required value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as "present" | "absent" | "late" })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                        <p className="text-gray-500">Track student attendance</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Mark Attendance
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Present</p><h2 className="text-2xl font-bold">{presentCount}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-lg text-red-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Absent</p><h2 className="text-2xl font-bold">{absentCount}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Late</p><h2 className="text-2xl font-bold">{lateCount}</h2></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by student or grade..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No attendance records yet.</td></tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.studentName}</td>
                                            <td className="px-6 py-4">{record.grade}</td>
                                            <td className="px-6 py-4 text-gray-600">{record.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(record.status)}`}>{record.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showModal && modalContent}
        </DashboardLayout>
    );
};

export default Attendance;
