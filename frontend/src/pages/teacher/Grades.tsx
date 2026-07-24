import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

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
    const [formData, setFormData] = useState<GradeForm>({
        studentId: "",
        subject: "",
        score: 0,
        grade: "",
        type: "Exam",
        semester: "Semester 1",
        academicYear: "2024/25", // Default
        classId: "",
        feedback: "",
    });

    useEffect(() => {
        fetchGradeData();
        fetchStudentsAndClasses();
    }, []);

    // ✅ Fetch grades with dynamic Academic Year
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
            
            // ✅ Use dynamic academic year
            const academicYear = formData.academicYear || "2024/25";
            
            console.log(`🔍 Fetching grades for class: ${classId}, Academic Year: ${academicYear}`);
            
            const gradesRes = await axios.get(
                `http://localhost:7000/api/grades/class/${classId}?semester=Semester%201&academicYear=${academicYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("📊 Grades received:", gradesRes.data.data);
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

    // ✅ Force refresh with dynamic Academic Year
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
            
            // ✅ Use dynamic academic year
            const academicYear = formData.academicYear || "2024/25";
            
            console.log(`🔄 Force refreshing grades for class: ${classId}, Academic Year: ${academicYear}`);
            
            const gradesRes = await axios.get(
                `http://localhost:7000/api/grades/class/${classId}?semester=Semester%201&academicYear=${academicYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("📊 Refreshed grades:", gradesRes.data.data);
            setGradeRecords(gradesRes.data.data || []);
        } catch (error) {
            console.error("❌ Error refreshing grades:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const gradeLetter = getGradeLetter(formData.score);
            
            const gradeData = {
                studentId: formData.studentId,
                subject: formData.subject,
                classId: formData.classId,
                type: formData.type,
                score: formData.score,
                grade: gradeLetter,
                feedback: formData.feedback,
                semester: formData.semester,
                academicYear: formData.academicYear,
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
                academicYear: formData.academicYear, // Keep the same academic year
                classId: formData.classId,
                feedback: "",
            });
            
            // ✅ Force refresh the list
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                            <input
                                type="number"
                                required
                                min={0}
                                max={100}
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
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
                    </div>

                    {/* ✅ Academic Year Field */}
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
                        <p className="text-gray-500">Record and manage student grades</p>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {gradeRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No grades recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    gradeRecords.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{record.studentId?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{record.subject}</td>
                                            <td className="px-6 py-4">{record.score}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(record.grade)}`}>
                                                    {record.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{record.type}</td>
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
            </div>

            {showModal && modalContent}
        </DashboardLayout>
    );
};

export default Grades;