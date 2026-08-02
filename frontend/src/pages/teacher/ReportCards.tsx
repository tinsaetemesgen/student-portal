// src/pages/teacher/ReportCards.tsx - FIXED DROPDOWNS

import { useState, useEffect } from "react";
import { 
    Upload, FileText, Download, Trash2, Search, 
    X, Check, RefreshCw, School, Users, 
    Eye, Edit2, Plus, Filter, Loader2
} from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface ReportCard {
    _id: string;
    studentId: { _id: string; name: string; email: string; class: string };
    classId: { _id: string; name: string; grade: string; section: string };
    term: string;
    academicYear: string;
    subjects: { name: string; score: number; grade: string; remarks: string }[];
    totalMarks: number;
    totalObtained: number;
    percentage: number;
    gpa: number;
    overallGrade: string;
    teacherRemarks: string;
    fileUrl: string;
    fileName: string;
    uploadedBy: { _id: string; name: string; email: string };
    status: string;
    isVisibleToStudent: boolean;
    isVisibleToParent: boolean;
    createdAt: string;
}

interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
    classLevel: string;
}

interface Class {
    _id: string;
    name: string;
    grade: string;
    section: string;
}

const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Final'];
const ACADEMIC_YEARS = ['2024/25', '2025/26', '2026/27', '2027/28'];
const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

const TeacherReportCards = () => {
    const [reportCards, setReportCards] = useState<ReportCard[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTerm, setFilterTerm] = useState<string>("");
    const [filterAcademicYear, setFilterAcademicYear] = useState<string>("");

    const [formData, setFormData] = useState({
        studentId: "",
        classId: "",
        term: "",
        academicYear: "",
        subjects: [] as { name: string; score: number; grade: string; remarks: string }[],
        subjectName: "",
        subjectScore: "",
        subjectGrade: "",
        subjectRemarks: "",
        totalMarks: "",
        totalObtained: "",
        percentage: "",
        gpa: "",
        overallGrade: "",
        teacherRemarks: "",
        status: "published",
        isVisibleToStudent: true,
        isVisibleToParent: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchReportCards(),
            fetchStudents(),
            fetchClasses()
        ]);
        setLoading(false);
    };

    const fetchReportCards = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:7000/api/report-cards';
            const params = new URLSearchParams();
            if (filterTerm) params.append('term', filterTerm);
            if (filterAcademicYear) params.append('academicYear', filterAcademicYear);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportCards(response.data.data || []);
        } catch (error: any) {
            console.error("Error fetching report cards:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            const token = localStorage.getItem('token');
            
            // ✅ First try to get students from registrar
            const response = await axios.get('http://localhost:7000/api/registrar/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const studentsData = response.data.data || [];
            setStudents(studentsData);
            console.log('📚 Students loaded:', studentsData.length);
            setLoadingStudents(false);
        } catch (error: any) {
            console.error("Error fetching students:", error);
            setLoadingStudents(false);
            
            // ✅ Fallback: Try to get students from another endpoint
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:7000/api/users?role=student', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(response.data.data || []);
                console.log('📚 Students loaded (fallback):', response.data.data?.length);
            } catch (fallbackError) {
                console.error("Fallback error fetching students:", fallbackError);
            }
        }
    };

    const fetchClasses = async () => {
        try {
            setLoadingClasses(true);
            const token = localStorage.getItem('token');
            
            // ✅ First try to get classes from registrar
            const response = await axios.get('http://localhost:7000/api/registrar/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const classesData = response.data.data || [];
            setClasses(classesData);
            console.log('📚 Classes loaded:', classesData.length);
            setLoadingClasses(false);
        } catch (error: any) {
            console.error("Error fetching classes:", error);
            setLoadingClasses(false);
            
            // ✅ Fallback: Try to get classes from another endpoint
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:7000/api/classes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClasses(response.data.data || []);
                console.log('📚 Classes loaded (fallback):', response.data.data?.length);
            } catch (fallbackError) {
                console.error("Fallback error fetching classes:", fallbackError);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const addSubject = () => {
        if (formData.subjectName && formData.subjectScore) {
            setFormData({
                ...formData,
                subjects: [...formData.subjects, {
                    name: formData.subjectName,
                    score: parseFloat(formData.subjectScore),
                    grade: formData.subjectGrade || '',
                    remarks: formData.subjectRemarks || '',
                }],
                subjectName: "",
                subjectScore: "",
                subjectGrade: "",
                subjectRemarks: "",
            });
        }
    };

    const removeSubject = (index: number) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.studentId || !formData.classId || !formData.term || !formData.academicYear) {
            alert('Please fill in all required fields.');
            return;
        }

        if (formData.subjects.length === 0) {
            alert('Please add at least one subject.');
            return;
        }

        const totalMarks = formData.subjects.reduce((sum, s) => sum + s.score, 0);
        const totalSubjects = formData.subjects.length;
        const percentage = totalSubjects > 0 ? (totalMarks / (totalSubjects * 100)) * 100 : 0;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('studentId', formData.studentId);
            formDataToSend.append('classId', formData.classId);
            formDataToSend.append('term', formData.term);
            formDataToSend.append('academicYear', formData.academicYear);
            formDataToSend.append('subjects', JSON.stringify(formData.subjects));
            formDataToSend.append('totalMarks', totalMarks.toString());
            formDataToSend.append('totalObtained', totalMarks.toString());
            formDataToSend.append('percentage', percentage.toString());
            formDataToSend.append('gpa', '0');
            formDataToSend.append('overallGrade', formData.overallGrade || '');
            formDataToSend.append('teacherRemarks', formData.teacherRemarks || '');
            formDataToSend.append('status', formData.status);
            formDataToSend.append('isVisibleToStudent', formData.isVisibleToStudent.toString());
            formDataToSend.append('isVisibleToParent', formData.isVisibleToParent.toString());
            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }

            await axios.post('http://localhost:7000/api/report-cards/upload', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(true);
            setSuccessMessage('✅ Report card uploaded successfully!');
            setShowModal(false);
            resetForm();
            fetchReportCards();

            setTimeout(() => {
                setSuccess(false);
                setSuccessMessage("");
            }, 5000);
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to upload report card");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            studentId: "",
            classId: "",
            term: "",
            academicYear: "",
            subjects: [],
            subjectName: "",
            subjectScore: "",
            subjectGrade: "",
            subjectRemarks: "",
            totalMarks: "",
            totalObtained: "",
            percentage: "",
            gpa: "",
            overallGrade: "",
            teacherRemarks: "",
            status: "published",
            isVisibleToStudent: true,
            isVisibleToParent: true,
        });
        setSelectedFile(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this report card?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7000/api/report-cards/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReportCards();
            alert('✅ Report card deleted successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to delete report card");
        }
    };

    const handleDownload = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:7000/api/report-cards/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-card.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to download report card");
        }
    };

    const handleView = (report: ReportCard) => {
        setSelectedReport(report);
        setShowViewModal(true);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700',
            published: 'bg-green-100 text-green-700',
            archived: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            A: 'text-green-700',
            'A-': 'text-green-600',
            'B+': 'text-blue-600',
            B: 'text-blue-600',
            'B-': 'text-blue-500',
            'C+': 'text-yellow-600',
            C: 'text-yellow-600',
            'C-': 'text-yellow-500',
            D: 'text-orange-600',
            F: 'text-red-600',
        };
        return colors[grade] || 'text-gray-600';
    };

    const filteredReports = reportCards.filter(r => {
        const matchSearch = r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.term?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading report cards...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-6">
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-3 animate-fadeIn">
                        <Check size={24} />
                        <p className="font-medium">{successMessage}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            Grade Reports
                        </h1>
                        <p className="text-gray-500">Upload and manage student report cards</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200"
                    >
                        <Upload size={18} />
                        Upload Report Card
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <p className="text-gray-500 text-sm">Total Reports</p>
                        <h2 className="text-2xl font-bold text-gray-800">{reportCards.length}</h2>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
                        <p className="text-green-600 text-sm">Published</p>
                        <h2 className="text-2xl font-bold text-green-700">
                            {reportCards.filter(r => r.status === 'published').length}
                        </h2>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
                        <p className="text-yellow-600 text-sm">Drafts</p>
                        <h2 className="text-2xl font-bold text-yellow-700">
                            {reportCards.filter(r => r.status === 'draft').length}
                        </h2>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
                        <p className="text-blue-600 text-sm">Students</p>
                        <h2 className="text-2xl font-bold text-blue-700">
                            {new Set(reportCards.map(r => r.studentId?._id)).size}
                        </h2>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or term..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterTerm}
                                onChange={(e) => setFilterTerm(e.target.value)}
                                className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Terms</option>
                                {TERMS.map(term => (
                                    <option key={term} value={term}>{term}</option>
                                ))}
                            </select>
                            <select
                                value={filterAcademicYear}
                                onChange={(e) => setFilterAcademicYear(e.target.value)}
                                className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Years</option>
                                {ACADEMIC_YEARS.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    setFilterTerm("");
                                    setFilterAcademicYear("");
                                    setSearchTerm("");
                                    fetchReportCards();
                                }}
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Cards Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Term</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Year</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            No report cards uploaded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{report.studentId?.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{report.studentId?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{report.classId?.name || 'N/A'}</td>
                                            <td className="px-4 py-3">{report.term}</td>
                                            <td className="px-4 py-3">{report.academicYear}</td>
                                            <td className="px-4 py-3">
                                                <span className={`font-bold ${getGradeColor(report.overallGrade)}`}>
                                                    {report.overallGrade || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleView(report)}
                                                        className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(report._id)}
                                                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                        title="Download"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report._id)}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Upload Modal - FIXED DROPDOWNS */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                Upload Report Card
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Student & Class - FIXED */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Student</option>
                                        {loadingStudents ? (
                                            <option value="" disabled>Loading students...</option>
                                        ) : students.length === 0 ? (
                                            <option value="" disabled>No students found</option>
                                        ) : (
                                            students.map(student => (
                                                <option key={student._id} value={student._id}>
                                                    {student.name} ({student.class || 'No Class'})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {students.length === 0 && !loadingStudents && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            ⚠️ No students found. Please create students first.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                                    <select
                                        required
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Class</option>
                                        {loadingClasses ? (
                                            <option value="" disabled>Loading classes...</option>
                                        ) : classes.length === 0 ? (
                                            <option value="" disabled>No classes found</option>
                                        ) : (
                                            classes.map(cls => (
                                                <option key={cls._id} value={cls._id}>
                                                    {cls.name} (Grade {cls.grade}{cls.section})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {classes.length === 0 && !loadingClasses && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            ⚠️ No classes found. Please create classes first.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Rest of the form remains the same... */}
                            {/* Term & Year */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                                    <select
                                        required
                                        value={formData.term}
                                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Term</option>
                                        {TERMS.map(term => (
                                            <option key={term} value={term}>{term}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                                    <select
                                        required
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Year</option>
                                        {ACADEMIC_YEARS.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects & Grades</label>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            value={formData.subjectName}
                                            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Score"
                                            value={formData.subjectScore}
                                            onChange={(e) => setFormData({ ...formData, subjectScore: e.target.value })}
                                            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            max="100"
                                        />
                                        <select
                                            value={formData.subjectGrade}
                                            onChange={(e) => setFormData({ ...formData, subjectGrade: e.target.value })}
                                            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Grade</option>
                                            {GRADES.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addSubject}
                                            className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition"
                                        >
                                            <Plus size={18} className="mx-auto" />
                                        </button>
                                    </div>
                                    {formData.subjects.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {formData.subjects.map((subject, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-medium">{subject.name}</span>
                                                        <span>{subject.score}%</span>
                                                        <span className={`font-bold ${getGradeColor(subject.grade)}`}>
                                                            {subject.grade}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubject(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {formData.subjects.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-2">Add at least one subject</p>
                                    )}
                                </div>
                            </div>

                            {/* Overall Grade & Remarks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Grade</label>
                                    <select
                                        value={formData.overallGrade}
                                        onChange={(e) => setFormData({ ...formData, overallGrade: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Grade</option>
                                        {GRADES.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Remarks</label>
                                <textarea
                                    rows={2}
                                    value={formData.teacherRemarks}
                                    onChange={(e) => setFormData({ ...formData, teacherRemarks: e.target.value })}
                                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter teacher remarks..."
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Card File (PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="report-upload"
                                    />
                                    <label htmlFor="report-upload" className="cursor-pointer block">
                                        {selectedFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="text-2xl">📄</span>
                                                <span className="text-gray-700 font-medium">{selectedFile.name}</span>
                                                <span className="text-sm text-gray-400">
                                                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">Click to upload PDF</p>
                                                <p className="text-xs text-gray-400 mt-1">Only PDF files (Max 20MB)</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Visibility */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVisibleToStudent}
                                        onChange={(e) => setFormData({ ...formData, isVisibleToStudent: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Visible to Student</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVisibleToParent}
                                        onChange={(e) => setFormData({ ...formData, isVisibleToParent: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Visible to Parent</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                            Uploading...
                                        </span>
                                    ) : (
                                        'Upload Report Card'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal (same as before) */}
            {showViewModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowViewModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Report Card Details</h2>
                            <button onClick={() => setShowViewModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Student Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Student</p>
                                    <p className="font-semibold">{selectedReport.studentId?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{selectedReport.studentId?.email || ''}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Class</p>
                                    <p className="font-semibold">{selectedReport.classId?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Term</p>
                                    <p className="font-semibold">{selectedReport.term}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Academic Year</p>
                                    <p className="font-semibold">{selectedReport.academicYear}</p>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Subjects</h3>
                                <div className="bg-gray-50 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Subject</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Score</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Grade</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedReport.subjects.map((subject, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{subject.name}</td>
                                                    <td className="px-4 py-2">{subject.score}%</td>
                                                    <td className={`px-4 py-2 font-bold ${getGradeColor(subject.grade)}`}>
                                                        {subject.grade}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{subject.remarks || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-4 gap-4 bg-blue-50 rounded-xl p-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="font-bold">{selectedReport.totalMarks}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Obtained</p>
                                    <p className="font-bold">{selectedReport.totalObtained}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Percentage</p>
                                    <p className="font-bold">{selectedReport.percentage}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Grade</p>
                                    <p className={`font-bold ${getGradeColor(selectedReport.overallGrade)}`}>
                                        {selectedReport.overallGrade || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Remarks */}
                            {selectedReport.teacherRemarks && (
                                <div>
                                    <p className="text-sm text-gray-500">Teacher Remarks</p>
                                    <p className="text-gray-700">{selectedReport.teacherRemarks}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {selectedReport.fileUrl && (
                                    <button
                                        onClick={() => handleDownload(selectedReport._id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <Download size={18} />
                                        Download PDF
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TeacherReportCards;