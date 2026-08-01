import { useState, useEffect } from "react";
import { Plus, X, BarChart3 } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Assessment {
    score: number;
    maxScore: number;
    weight: number;
}

interface GradeRecord {
    _id: string;
    studentId: {
        _id: string;
        name: string;
    };
    subject: string;
    score: number;
    grade: string;
    type: string;
    semester: string;
    academicYear: string;
    date: string;
    totalScore?: number;
    letterGrade?: string;
    gradePoints?: number;
    assessments?: {
        quiz: Assessment;
        homework: Assessment;
        classTest: Assessment;
        finalTest: Assessment;
        groupWork: Assessment;
    };
    feedback?: string;
}

interface GradeForm {
    studentId: string;
    subject: string;
    score: number;
    grade: string;
    type: string;
    semester: string;
    academicYear: string;
    classId: string;
    feedback: string;
    assessments: {
        quiz: Assessment;
        homework: Assessment;
        classTest: Assessment;
        finalTest: Assessment;
        groupWork: Assessment;
    };
}

interface ClassData {
    _id: string;
    name: string;
}

interface Student {
    _id: string;
    name: string;
    email: string;
}

const Grades = () => {
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
    const [formData, setFormData] = useState<GradeForm>({
        studentId: "",
        subject: "",
        score: 0,
        grade: "",
        type: "Exam",
        semester: "Semester 1",
        academicYear: "2024/25",
        classId: "",
        feedback: "",
        assessments: {
            quiz: { score: 0, maxScore: 20, weight: 15 },
            homework: { score: 0, maxScore: 15, weight: 10 },
            classTest: { score: 0, maxScore: 20, weight: 20 },
            finalTest: { score: 0, maxScore: 50, weight: 35 },
            groupWork: { score: 0, maxScore: 20, weight: 20 },
        },
    });

    useEffect(() => {
        fetchGradeData();
        fetchStudentsAndClasses();
    }, []);

    const fetchGradeData = async () => {
        try {
            const token = localStorage.getItem('token');

            let classId = formData.classId;
            if (!classId) {
                const classesRes = await axios.get('http://localhost:7000/api/classes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const classList = classesRes.data.data || [];
                setClasses(classList);
                if (classList.length > 0) {
                    classId = classList[0]._id;
                    setFormData(prev => ({ ...prev, classId }));
                }
            }

            if (!classId) {
                console.log("❌ No class found");
                setLoading(false);
                return;
            }

            const academicYear = formData.academicYear || "2024/25";

            const gradesRes = await axios.get(
                `http://localhost:7000/api/grades/class/${classId}?semester=Semester%201&academicYear=${academicYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setGradeRecords(gradesRes.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching grades:", error);
            setLoading(false);
        }
    };

    const fetchStudentsAndClasses = async () => {
        try {
            const token = localStorage.getItem('token');

            const studentsRes = await axios.get('http://localhost:7000/api/users?role=student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(studentsRes.data.data || []);

            const classesRes = await axios.get('http://localhost:7000/api/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(classesRes.data.data || []);

            if (classesRes.data.data && classesRes.data.data.length > 0) {
                setFormData(prev => ({ ...prev, classId: classesRes.data.data[0]._id }));
            }
        } catch (error) {
            console.error("Error fetching students/classes:", error);
        }
    };

    const getGradeLetter = (score: number): string => {
        if (score >= 97) return "A+";
        if (score >= 93) return "A";
        if (score >= 90) return "A-";
        if (score >= 87) return "B+";
        if (score >= 83) return "B";
        if (score >= 80) return "B-";
        if (score >= 77) return "C+";
        if (score >= 73) return "C";
        if (score >= 70) return "C-";
        if (score >= 65) return "D";
        return "F";
    };

    const forceRefreshGrades = async () => {
        try {
            const token = localStorage.getItem('token');
            let classId = formData.classId;

            if (!classId) {
                if (classes.length > 0) {
                    classId = classes[0]._id;
                } else {
                    console.log("❌ No classes available");
                    return;
                }
            }

            const academicYear = formData.academicYear || "2024/25";

            const gradesRes = await axios.get(
                `http://localhost:7000/api/grades/class/${classId}?semester=Semester%201&academicYear=${academicYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setGradeRecords(gradesRes.data.data || []);
        } catch (error) {
            console.error("❌ Error refreshing grades:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const gradeData = {
                studentId: formData.studentId,
                subject: formData.subject,
                classId: formData.classId,
                type: formData.type,
                semester: formData.semester,
                academicYear: formData.academicYear,
                feedback: formData.feedback,
                assessments: {
                    quiz: { score: formData.assessments.quiz.score, maxScore: 20, weight: 15 },
                    homework: { score: formData.assessments.homework.score, maxScore: 15, weight: 10 },
                    classTest: { score: formData.assessments.classTest.score, maxScore: 20, weight: 20 },
                    finalTest: { score: formData.assessments.finalTest.score, maxScore: 50, weight: 35 },
                    groupWork: { score: formData.assessments.groupWork.score, maxScore: 20, weight: 20 },
                }
            };

            console.log("📤 Sending grade:", gradeData);

            await axios.post('http://localhost:7000/api/grades', gradeData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ Grade saved successfully");

            setShowModal(false);
            setFormData({
                studentId: "",
                subject: "",
                score: 0,
                grade: "",
                type: "Exam",
                semester: "Semester 1",
                academicYear: formData.academicYear,
                classId: formData.classId,
                feedback: "",
                assessments: {
                    quiz: { score: 0, maxScore: 20, weight: 15 },
                    homework: { score: 0, maxScore: 15, weight: 10 },
                    classTest: { score: 0, maxScore: 20, weight: 20 },
                    finalTest: { score: 0, maxScore: 50, weight: 35 },
                    groupWork: { score: 0, maxScore: 20, weight: 20 },
                },
            });

            await forceRefreshGrades();

        } catch (error: any) {
            console.error("❌ Error adding grade:", error);
            alert(error.response?.data?.error || "Failed to add grade");
        }
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

        return (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Assessment Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {keys.map((key) => {
                        const data = assessments[key as keyof typeof assessments];
                        if (!data) return null;
                        const percentage = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
                        return (
                            <div key={key} className="bg-white p-2 rounded border border-gray-100 text-center">
                                <div className="text-xs text-gray-500">{getAssessmentIcon(key)} {getAssessmentLabel(key)}</div>
                                <div className="font-bold text-sm">{data.score}/{data.maxScore}</div>
                                <div className="text-xs text-gray-400">{data.weight}% weight</div>
                                <div className="text-xs font-medium text-blue-600">{percentage}%</div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600">Total Score: <strong className="text-gray-800">{grade.totalScore || grade.score}%</strong></span>
                    <span className="text-gray-600">Grade: <strong className={`${getGradeColor(grade.letterGrade || grade.grade || '')}`}>{grade.letterGrade || grade.grade}</strong></span>
                    <span className="text-gray-600">GPA: <strong className="text-gray-800">{grade.gradePoints?.toFixed(1) || 'N/A'}</strong></span>
                </div>
                {grade.feedback && (
                    <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                        💬 <span className="italic">{grade.feedback}</span>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading grades...</div>
                </div>
            </DashboardLayout>
        );
    }

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold">Add Grade</h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            required
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select
                            required
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>{student.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Mathematics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Exam">Exam</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Project">Project</option>
                                <option value="Participation">Participation</option>
                                <option value="Homework">Homework</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                            <input
                                type="text"
                                required
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 2024/25"
                            />
                        </div>
                    </div>

                    {/* ✅ Assessment Fields */}
                    <div className="border-t pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Assessment Scores</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Quiz (15%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={formData.assessments.quiz.score}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        assessments: {
                                            ...formData.assessments,
                                            quiz: { ...formData.assessments.quiz, score: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/20"
                                />
                                <span className="text-xs text-gray-400">/20</span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Homework (10%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={formData.assessments.homework.score}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        assessments: {
                                            ...formData.assessments,
                                            homework: { ...formData.assessments.homework, score: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/15"
                                />
                                <span className="text-xs text-gray-400">/15</span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Class Test (20%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={formData.assessments.classTest.score}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        assessments: {
                                            ...formData.assessments,
                                            classTest: { ...formData.assessments.classTest, score: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/20"
                                />
                                <span className="text-xs text-gray-400">/20</span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Final Test (35%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.assessments.finalTest.score}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        assessments: {
                                            ...formData.assessments,
                                            finalTest: { ...formData.assessments.finalTest, score: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/50"
                                />
                                <span className="text-xs text-gray-400">/50</span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Group Work (20%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={formData.assessments.groupWork.score}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        assessments: {
                                            ...formData.assessments,
                                            groupWork: { ...formData.assessments.groupWork, score: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                    className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/20"
                                />
                                <span className="text-xs text-gray-400">/20</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (optional)</label>
                        <input
                            type="text"
                            value={formData.feedback}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Good work!"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Grade
                        </button>
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
                        <h1 className="text-2xl font-bold text-gray-800">Grade Management</h1>
                        <p className="text-gray-500">Record and manage student grades with weighted assessments</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} /> Add Grade
                    </button>
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
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {gradeRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No grades recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    gradeRecords.map((record) => (
                                        <>
                                            <tr key={record._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{record.studentId?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4">{record.subject}</td>
                                                <td className="px-6 py-4 font-bold">{record.totalScore || record.score}%</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(record.letterGrade || record.grade || '')}`}>
                                                        {record.letterGrade || record.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{record.type}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.assessments && (
                                                        <button
                                                            onClick={() => toggleExpand(record._id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            <BarChart3 size={16} />
                                                            {expandedGrade === record._id ? 'Hide' : 'View'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedGrade === record._id && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
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
            </div>

            {showModal && modalContent}
        </DashboardLayout>
    );
};

export default Grades;