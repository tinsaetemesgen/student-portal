import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Trophy, Filter, BarChart3 } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface Assessment {
    score: number;
    maxScore: number;
    weight: number;
}

interface GradeRecord {
    _id: string;
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
    assessments?: {
        quiz: Assessment;
        homework: Assessment;
        classTest: Assessment;
        finalTest: Assessment;
        groupWork: Assessment;
    };
    totalScore?: number;
    letterGrade?: string;
    gradePoints?: number;
    feedback?: string;
}

const MyGrades = () => {
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get('https://kamara-school-backend.onrender.com/api/grades/my-grades', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const grades: GradeRecord[] = response.data.data || [];
                setGradeRecords(grades);

                const uniqueSubjects = [...new Set(grades.map((g: GradeRecord) => g.subject).filter(Boolean))];
                setSubjects(uniqueSubjects);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching grades:", error);
                setError(getApiErrorMessage(error, "Failed to load grades"));
                setLoading(false);
            }
        }
        load();
    }, []);

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
        ? Math.round(filteredGrades.reduce((sum, r) => sum + (r.totalScore || r.score || 0), 0) / totalSubjects)
        : 0;

    const bestSubject = filteredGrades.length > 0
        ? filteredGrades.reduce((best, r) => (r.totalScore || r.score || 0) > (best?.totalScore || best?.score || 0) ? r : best, filteredGrades[0])
        : null;

    const gradeColors: Record<string, string> = {
        'A+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'A': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'A-': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'B-': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'C+': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'C-': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'F': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'I': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    };

    const getGradeColor = (grade: string) => {
        return gradeColors[grade] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    };

    const getAssessmentIcon = (key: string) => {
        const icons: Record<string, string> = {
            quiz: '📝',
            homework: '📚',
            classTest: '📊',
            finalTest: '🎯',
            groupWork: '👥',
        };
        return icons[key] || '📋';
    };

    const getAssessmentLabel = (key: string) => {
        const labels: Record<string, string> = {
            quiz: 'Quiz',
            homework: 'Homework',
            classTest: 'Class Test',
            finalTest: 'Final Test',
            groupWork: 'Group Work',
        };
        return labels[key] || key;
    };

    const toggleExpand = (id: string) => {
        setExpandedGrade(expandedGrade === id ? null : id);
    };

   
const renderAssessmentBreakdown = (grade: GradeRecord) => {
    if (!grade.assessments) return null;

    const assessments = grade.assessments;
    const keys = ['quiz', 'homework', 'classTest', 'finalTest', 'groupWork'];
    const allComplete = keys.every(key => assessments[key as keyof typeof assessments]?.score > 0);
    
    // ✅ Get pending assessments
    const pendingAssessments = keys
        .filter(key => assessments[key as keyof typeof assessments]?.score === 0)
        .map(key => {
            const labels: Record<string, string> = {
                quiz: 'Quiz',
                homework: 'Homework',
                classTest: 'Class Test',
                finalTest: 'Final Test',
                groupWork: 'Group Work',
            };
            return labels[key] || key;
        });

    return (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📊 Assessment Breakdown</h4>
            
            {/* ✅ Show status message */}
            {!allComplete && (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ <span className="font-medium">Incomplete Grade</span> — Missing: {pendingAssessments.join(', ')}
                    <span className="block text-xs text-yellow-600 dark:text-yellow-400 mt-1">This grade will be calculated once all assessments are entered.</span>
                </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {keys.map((key) => {
                    const data = assessments[key as keyof typeof assessments];
                    if (!data) return null;
                    const percentage = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
                    const isPending = data.score === 0;
                    return (
                        <div key={key} className={`bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 text-center ${isPending ? 'opacity-50' : ''}`}>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{getAssessmentIcon(key)} {getAssessmentLabel(key)}</div>
                            <div className="font-bold text-sm">
                                {isPending ? '—' : `${data.score}/${data.maxScore}`}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{data.weight}% weight</div>
                            <div className={`text-xs font-medium ${isPending ? 'text-gray-400 dark:text-gray-500' : 'text-blue-600 dark:text-blue-400'}`}>
                                {isPending ? '⏳ Pending' : `${percentage}%`}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* ✅ Show total only if complete */}
            {allComplete ? (
                <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Score: <strong className="text-gray-800 dark:text-gray-100">{grade.totalScore || grade.score}%</strong></span>
                    <span className="text-gray-600 dark:text-gray-300">Grade: <strong className={`${getGradeColor(grade.letterGrade || grade.grade || '')}`}>{grade.letterGrade || grade.grade}</strong></span>
                    <span className="text-gray-600 dark:text-gray-300">GPA: <strong className="text-gray-800 dark:text-gray-100">{grade.gradePoints?.toFixed(1) || 'N/A'}</strong></span>
                </div>
            ) : (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                    ⏳ Waiting for {pendingAssessments.join(', ')} to calculate final grade.
                </div>
            )}
            
            {grade.feedback && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 border-t pt-2">
                    💬 <span className="italic">{grade.feedback}</span>
                </div>
            )}
        </div>
    );
};

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading your grades...</div>
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Grades</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your academic performance with detailed assessment breakdowns</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400"><GraduationCap size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Subjects</p>
                            <h2 className="text-2xl font-bold">{totalSubjects}</h2>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-green-600 dark:text-green-400"><BookOpen size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Average Score</p>
                            <h2 className="text-2xl font-bold">{averageScore}%</h2>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-yellow-600 dark:text-yellow-400"><Trophy size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Best Subject</p>
                            <h2 className="text-lg font-bold truncate max-w-[120px]">
                                {bestSubject?.subject || "N/A"}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {(subjects.length > 0 || gradeRecords.length > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Filter size={18} />
                                <span className="font-medium">Filters:</span>
                            </div>
                            <div className="min-w-[150px]">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {/* Grade Table with Expandable Rows */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Score</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Grade</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Teacher</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredGrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            {gradeRecords.length === 0 
                                                ? "No grades available yet." 
                                                : "No grades match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrades.map((record) => (
                                        <>
                                            <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 font-medium">{record.subject}</td>
                                                <td className="px-6 py-4 font-bold">{record.totalScore || record.score}%</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(record.letterGrade || record.grade || '')}`}>
                                                        {record.letterGrade || record.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{record.type || 'Standard'}</td>
                                                <td className="px-6 py-4">{record.teacherId?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleExpand(record._id)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <BarChart3 size={16} />
                                                        {expandedGrade === record._id ? 'Hide Details' : 'View Details'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedGrade === record._id && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                                                        {renderAssessmentBreakdown(record)}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GPA Summary */}
                {totalSubjects > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">📊 GPA (Grade Point Average):</span>{' '}
                            {averageScore >= 90 ? '🌟 Excellent!' :
                             averageScore >= 80 ? '👍 Good Job!' :
                             averageScore >= 70 ? '💪 Keep Going!' :
                             averageScore >= 60 ? '📚 Need Improvement' :
                             '🎯 Please Focus!'}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyGrades;