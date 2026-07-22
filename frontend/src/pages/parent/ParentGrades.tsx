import { GraduationCap, BookOpen } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const ParentGrades = () => {
    const { gradeRecords } = useAppContext();

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
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><GraduationCap size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Total Records</p><h2 className="text-2xl font-bold">{gradeRecords.length}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><BookOpen size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Average Score</p><h2 className="text-2xl font-bold">{averageScore}%</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><GraduationCap size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Subjects</p><h2 className="text-2xl font-bold">{new Set(gradeRecords.map(r => r.subject)).size}</h2></div>
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
                                {gradeRecords.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No grades available yet.</td></tr>
                                ) : (
                                    gradeRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.studentName}</td>
                                            <td className="px-6 py-4">{record.subject}</td>
                                            <td className="px-6 py-4">{record.score}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{record.grade}</span>
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
