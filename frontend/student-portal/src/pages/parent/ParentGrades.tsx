import { useState } from "react";
import { Search, GraduationCap, BookOpen } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const ParentGrades = () => {
    const { gradeRecords } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRecords = gradeRecords.filter((record) =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const averageScore = gradeRecords.length > 0
        ? Math.round(gradeRecords.reduce((sum, r) => sum + r.score, 0) / gradeRecords.length)
        : 0;

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
                    <p className="text-gray-500">View your children's academic performance</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><GraduationCap size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Total Records</p><h2 className="text-2xl font-bold">{gradeRecords.length}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600"><BookOpen size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Average Score</p><h2 className={`text-2xl font-bold ${averageScore >= 70 ? "text-green-600" : averageScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{averageScore}%</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><GraduationCap size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Subjects</p><h2 className="text-2xl font-bold">{new Set(gradeRecords.map(r => r.subject)).size}</h2></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by student or subject..."
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
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Score</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No grades available yet.</td></tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.studentName}</td>
                                            <td className="px-6 py-4">{record.subject}</td>
                                            <td className="px-6 py-4">{record.score}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.score >= 70 ? "bg-green-100 text-green-700" :
                                                    record.score >= 50 ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                                    }`}>{record.grade}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{record.date}</td>
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

export default ParentGrades;
