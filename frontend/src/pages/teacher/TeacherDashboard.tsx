// src/pages/teacher/TeacherDashboard.tsx - COMPLETE DASHBOARD

import { useState, useEffect } from "react";
import {
    BookOpen,
    Users,
    Award,
    GraduationCap,
    Calendar,
    ClipboardList,
    FileCheck,
    FolderOpen,
    BookMarked,
    Megaphone,
    ChevronRight,
    Sparkles,
    Clock,
    User,
    School,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface TeacherClass {
    _id: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
    subjects: string[];
    teacherIds: { _id: string; name: string; subject: string }[];
    students: { _id: string; name: string; email: string }[];
}

interface GradeRecord {
    _id: string;
    studentId: { _id: string; name: string; email: string };
    subject: string;
    type: string;
    score: number;
    grade: string;
    date: string;
    createdAt: string;
    semester: string;
    academicYear: string;
}

const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

const getGradeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 75) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

const TeacherDashboard = () => {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    });

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const teacherName = user?.name || 'Teacher';
    const subject = user?.subject || '';

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1️⃣ My classes (backend filters by the logged-in teacher)
                const classRes = await axios.get('https://kamara-school-backend.onrender.com/api/classes', { headers });
                const myClasses = classRes.data.data || [];
                setClasses(myClasses);

                // 2️⃣ Recent grades across my classes
                const gradeResults = await Promise.all(
                    myClasses.map((c: TeacherClass) =>
                        axios
                            .get(
                                `https://kamara-school-backend.onrender.com/api/grades/class/${c._id}?semester=Semester%201&academicYear=${c.academicYear}`,
                                { headers }
                            )
                            .then((r) => r.data.data || [])
                            .catch(() => [])
                    )
                );
                const allGrades = gradeResults.flat();
                setGrades(allGrades);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching teacher dashboard data:", err);
                setError(getApiErrorMessage(err, "Failed to load dashboard data"));
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && classes.length === 0) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    const totalStudents = new Set(classes.flatMap((c) => c.students.map((s) => s._id))).size;
    const avgScore = grades.length
        ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        : 0;

    const stats = [
        { title: "My Classes", value: classes.length, icon: <School size={22} className="text-blue-600" />, iconBg: 'bg-blue-100 dark:bg-blue-900/30' },
        { title: "Students", value: totalStudents, icon: <Users size={22} className="text-green-600" />, iconBg: 'bg-green-100 dark:bg-green-900/30' },
        { title: "Grades Entered", value: grades.length, icon: <Award size={22} className="text-purple-600" />, iconBg: 'bg-purple-100 dark:bg-purple-900/30' },
        { title: "Average Score", value: `${avgScore}%`, icon: <GraduationCap size={22} className="text-yellow-600" />, iconBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    ];

    const quickActions = [
        { icon: <ClipboardList size={20} />, label: 'Take Attendance', path: '/teacher/attendance', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
        { icon: <Award size={20} />, label: 'Enter Grades', path: '/teacher/grades', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
        { icon: <BookMarked size={20} />, label: 'Worksheets', path: '/teacher/worksheets', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
        { icon: <FileCheck size={20} />, label: 'Report Cards', path: '/teacher/report-cards', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
        { icon: <FolderOpen size={20} />, label: 'Resources', path: '/teacher/resources', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
        { icon: <Megaphone size={20} />, label: 'Announcements', path: '/teacher/announcements', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    ];

    return (
        <DashboardLayout role="teacher">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* ============================================
                    HEADER WITH GREETING
                    ============================================ */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            {greeting}, {teacherName}!
                            <Sparkles size={20} className="text-yellow-500" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {subject ? `Teaching ${subject}` : "Welcome to your teaching workspace"}
                            {classes.length > 0 && ` • ${classes.length} active class${classes.length !== 1 ? 'es' : ''}`}
                        </p>
                    </div>
                    <Link
                        to="/teacher/attendance"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex items-center gap-2 w-fit"
                    >
                        <Calendar size={18} />
                        Take Attendance
                        <ChevronRight size={16} />
                    </Link>
                </div>

                {/* ============================================
                    STATS CARDS
                    ============================================ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stat.value}</h2>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.iconBg}`}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ============================================
                    QUICK ACTIONS
                    ============================================ */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            to={action.path}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col items-center gap-2 text-center group"
                        >
                            <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 transition`}>
                                {action.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
                        </Link>
                    ))}
                </div>

                {/* ============================================
                    MY CLASSES
                    ============================================ */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <School size={20} className="text-blue-600" />
                            My Classes
                        </h2>
                        <Link
                            to="/teacher/grades"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                            Manage Grades <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4">
                        {classes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p>You are not assigned to any classes yet.</p>
                                <p className="text-sm">Contact the registrar or admin to get assigned.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classes.map((cls) => (
                                    <div key={cls._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {cls.name} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({cls.academicYear})</span>
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={12} /> {cls.students.length} students
                                                    </span>
                                                    {cls.subjects?.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen size={12} /> {cls.subjects.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                to="/teacher/grades"
                                                className="shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                title="View grades"
                                            >
                                                <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================
                    RECENT GRADES
                    ============================================ */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Award size={20} className="text-blue-600" />
                            Recent Grades
                        </h2>
                        <Link
                            to="/teacher/grades"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr className="text-left text-sm text-gray-500 dark:text-gray-300">
                                    <th className="px-5 py-3 font-semibold">Student</th>
                                    <th className="px-5 py-3 font-semibold">Subject</th>
                                    <th className="px-5 py-3 font-semibold">Type</th>
                                    <th className="px-5 py-3 font-semibold">Score</th>
                                    <th className="px-5 py-3 font-semibold">Grade</th>
                                    <th className="px-5 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {grades.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <Award size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            No grades entered yet. Head to the Grades page to record your first scores.
                                        </td>
                                    </tr>
                                ) : (
                                    grades.slice(0, 8).map((g) => (
                                        <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                                        {(g.studentId?.name || '?').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{g.studentId?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                            <User size={10} /> {g.studentId?.email || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{g.subject}</td>
                                            <td className="px-5 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {g.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100">{g.score}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(g.score)}`}>
                                                    {g.grade}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock size={12} /> {getTimeAgo(g.date || g.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ============================================
                    TIP BANNER
                    ============================================ */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <Sparkles size={24} className="text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">Quick reminder</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You have {grades.length} grade{grades.length !== 1 ? 's' : ''} recorded across {classes.length} class{classClasses(classes.length)}. Keep your attendance and grades up to date for the report card cycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const classClasses = (n: number) => (n === 1 ? '' : 'es');

export default TeacherDashboard;
