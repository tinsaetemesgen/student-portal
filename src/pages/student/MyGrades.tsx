import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Trophy, Filter } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

// ✅ Define proper types
interface GradeRecord {
    _id: string;
    studentId: {
        _id: string;
        name: string;
        class: string;
    };
    subject: string;
    score: number;
    grade: string;
    type: string;
    semester: string;
    academicYear: string;
    date: string;
    teacherId?: {
        name: string;
    };
}

const MyGrades = () => {
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [subjects, setSubjects] = useState<string[]>([]);

    useEffect(() => {
        fetchMyGrades();
    }, []);

    const fetchMyGrades = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:7000/api/grades/my-grades', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // ✅ Type assertion: tell TypeScript this is an array of GradeRecord
            const grades: GradeRecord[] = response.data.data || [];
            setGradeRecords(grades);

            // ✅ Filter out undefined/null subjects
            const uniqueSubjects = [...new Set(grades.map((g: GradeRecord) => g.subject).filter(Boolean))];
            setSubjects(uniqueSubjects);

            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching grades:", error);
            setError(error.response?.data?.error || "Failed to load grades");
            setLoading(false);
        }
    };

    const getFilteredGrades = () => {
        let filtered = gradeRecords;

        if (selectedSemester) {
            filtered = filtered.filter(g => g.semester === selectedSemester);
        }
        if (selectedSubject) {
            filtered = filtered.filter(g => g.subject === selectedSubject);
        }

        return filtered;
    };

    const filteredGrades = getFilteredGrades();

    const totalSubjects = filteredGrades.length;
    const averageScore = totalSubjects > 0
        ? Math.round(filteredGrades.reduce((sum, r) => sum + r.score, 0) / totalSubjects)
        : 0;

    const bestSubject = filteredGrades.length > 0
        ? filteredGrades.reduce((best, r) => r.score > (best?.score || 0) ? r : best, filteredGrades[0])
        : null;

    const gradeColors: Record<string, string> = {
        'A+': 'bg-green-100 text-green-700',
        'A': 'bg-green-100 text-green-700',
        'A-': 'bg-green-100 text-green-700',
        'B+': 'bg-blue-100 text-blue-700',
        'B': 'bg-blue-100 text-blue-700',
        'B-': 'bg-blue-100 text-blue-700',
        'C+': 'bg-yellow-100 text-yellow-700',
        'C': 'bg-yellow-100 text-yellow-700',
        'C-': 'bg-yellow-100 text-yellow-700',
        'D': 'bg-orange-100 text-orange-700',
        'F': 'bg-red-100 text-red-700',
    };

    const getGradeColor = (grade: string) => {
        return gradeColors[grade] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading your grades...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
                    <p className="text-gray-500">View your academic performance</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><GraduationCap size={25} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Subjects</p>
                            <h2 className="text-2xl font-bold">{totalSubjects}</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600"><BookOpen size={25} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Average Score</p>
                            <h2 className="text-2xl font-bold">{averageScore}%</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><Trophy size={25} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Best Subject</p>
                            <h2 className="text-lg font-bold truncate max-w-[120px]">
                                {bestSubject?.subject || "N/A"}
                            </h2>
                        </div>
                    </div>
                </div>

                {(subjects.length > 0 || gradeRecords.length > 0) && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Filter size={18} />
                                <span className="font-medium">Filters:</span>
                            </div>
                            <div className="min-w-[150px]">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map((subject) => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="min-w-[150px]">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Semesters</option>
                                    <option value="Semester 1">Semester 1</option>
                                    <option value="Semester 2">Semester 2</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedSubject("");
                                    setSelectedSemester("");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Score</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Teacher</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredGrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            {gradeRecords.length === 0 
                                                ? "No grades available yet." 
                                                : "No grades match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrades.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.subject}</td>
                                            <td className="px-6 py-4">{record.score}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(record.grade)}`}>
                                                    {record.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{record.type}</td>
                                            <td className="px-6 py-4">{record.teacherId?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalSubjects > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">📊 GPA (Grade Point Average):</span>{' '}
                            {averageScore >= 90 ? 'Excellent! 🌟' :
                             averageScore >= 80 ? 'Good Job! 👍' :
                             averageScore >= 70 ? 'Keep Going! 💪' :
                             averageScore >= 60 ? 'Need Improvement 📚' :
                             'Please Focus! 🎯'}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyGrades;