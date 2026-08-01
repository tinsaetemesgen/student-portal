import { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface GradeStats {
    totalGrades: number;
    averageScore: number;
    gradeDistribution: {
        _id: string;
        count: number;
    }[];
}

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

interface ClassData {
    _id: string;
    name: string;
}

const AdminGrades = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<GradeStats | null>(null);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [filteredGrades, setFilteredGrades] = useState<GradeRecord[]>([]);

    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");

    const [classes, setClasses] = useState<ClassData[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // 1️⃣ Get all grades
            const gradesRes = await axios.get('http://localhost:7000/api/grades/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allGrades: GradeRecord[] = gradesRes.data.data || [];
            setGrades(allGrades);
            setFilteredGrades(allGrades);

            // 2️⃣ Get grade statistics
            const statsRes = await axios.get('http://localhost:7000/api/grades/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats(statsRes.data.data);

            // 3️⃣ Extract unique subjects
            const uniqueSubjects = [...new Set(allGrades.map((g: GradeRecord) => g.subject).filter(Boolean))];
            setSubjects(uniqueSubjects);

            // 4️⃣ Get classes for filter
            const classesRes = await axios.get('http://localhost:7000/api/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(classesRes.data.data || []);

            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching grade data:", error);
            setError(error.response?.data?.error || "Failed to load grade data");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...grades];

        if (selectedClass) {
            filtered = filtered.filter(g => g.studentId?.class === selectedClass);
        }
        if (selectedSubject) {
            filtered = filtered.filter(g => g.subject === selectedSubject);
        }
        if (selectedSemester) {
            filtered = filtered.filter(g => g.semester === selectedSemester);
        }
        if (selectedAcademicYear) {
            filtered = filtered.filter(g => g.academicYear === selectedAcademicYear);
        }

        setFilteredGrades(filtered);
    };

    const resetFilters = () => {
        setSelectedClass("");
        setSelectedSubject("");
        setSelectedSemester("");
        setSelectedAcademicYear("");
        setFilteredGrades(grades);
    };

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

    useEffect(() => {
        if (grades.length > 0) {
            applyFilters();
        }
    }, [selectedClass, selectedSubject, selectedSemester, selectedAcademicYear]);

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading grade data...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Grade Overview</h1>
                    <p className="text-gray-500 mt-1">Manage grade reports and academic progress from here.</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
                            <p className="text-gray-500 text-sm">Total Grades</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.totalGrades || 0}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
                            <p className="text-gray-500 text-sm">Average Score</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {stats.averageScore ? stats.averageScore.toFixed(1) : 0}%
                            </h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
                            <p className="text-gray-500 text-sm">Most Common Grade</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {stats.gradeDistribution?.length > 0
                                    ? stats.gradeDistribution.reduce((a, b) => a.count > b.count ? a : b)._id
                                    : 'N/A'}
                            </h3>
                        </div>
                    </div>
                )}

                {stats && stats.gradeDistribution && stats.gradeDistribution.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
                        <div className="flex flex-wrap gap-2">
                            {stats.gradeDistribution.map((item) => (
                                <div key={item._id} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(item._id)}`}>
                                        {item._id}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls._id} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Subject</label>
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

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Semester</label>
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

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Academic Year</label>
                            <input
                                type="text"
                                placeholder="e.g., 2024/25"
                                value={selectedAcademicYear}
                                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Reset Filters
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">
                            All Grades {filteredGrades.length > 0 && `(${filteredGrades.length} records)`}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Class</th>
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
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No grade records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrades.map((grade) => (
                                        <tr key={grade._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{grade.studentId?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{grade.studentId?.class || 'N/A'}</td>
                                            <td className="px-6 py-4">{grade.subject}</td>
                                            <td className="px-6 py-4">{grade.score}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.grade)}`}>
                                                    {grade.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{grade.type}</td>
                                            <td className="px-6 py-4">{grade.teacherId?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(grade.date).toLocaleDateString()}
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

export default AdminGrades;