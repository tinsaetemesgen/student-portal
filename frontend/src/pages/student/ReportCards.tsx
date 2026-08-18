// src/pages/student/ReportCards.tsx - Student View Report Cards

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Award, BookOpen, X } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface ReportCard {
    _id: string;
    studentId: { _id: string; name: string; email: string };
    classId: { _id: string; name: string };
    term: string;
    academicYear: string;
    subjects: { name: string; score: number; grade: string; remarks: string }[];
    totalMarks: number;
    totalObtained: number;
    percentage: number;
    overallGrade: string;
    teacherRemarks: string;
    fileUrl: string;
    createdAt: string;
}

const StudentReportCards = () => {
    const [reportCards, setReportCards] = useState<ReportCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://kamara-school-backend.onrender.com/api/report-cards', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReportCards(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching report cards:", error);
                setError(getApiErrorMessage(error, "Failed to load report cards"));
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleDownload = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://kamara-school-backend.onrender.com/api/report-cards/${id}/download`, {
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
        } catch (error) {
            alert(getApiErrorMessage(error, "Failed to download report card"));
        }
    };

    const handleView = (report: ReportCard) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            A: 'text-green-700 dark:text-green-400',
            'A-': 'text-green-600 dark:text-green-400',
            'B+': 'text-blue-600 dark:text-blue-400',
            B: 'text-blue-600 dark:text-blue-400',
            'B-': 'text-blue-500 dark:text-blue-400',
            'C+': 'text-yellow-600 dark:text-yellow-400',
            C: 'text-yellow-600 dark:text-yellow-400',
            'C-': 'text-yellow-500 dark:text-yellow-400',
            D: 'text-orange-600 dark:text-orange-400',
            F: 'text-red-600 dark:text-red-400',
        };
        return colors[grade] || 'text-gray-600 dark:text-gray-300';
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading report cards...</p>
                    </div>
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Award size={24} className="text-blue-600" />
                        My Report Cards
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">View your academic performance</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reports</p>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{reportCards.length}</h2>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-400 text-sm">Terms</p>
                        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {new Set(reportCards.map(r => r.term)).size}
                        </h2>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm p-4 border border-green-200 dark:border-green-800">
                        <p className="text-green-600 dark:text-green-400 text-sm">Avg Grade</p>
                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {reportCards.length > 0 
                                ? Math.round(reportCards.reduce((sum, r) => sum + r.percentage, 0) / reportCards.length) 
                                : 0}%
                        </h2>
                    </div>
                </div>

                {/* Report Cards List */}
                {reportCards.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No Report Cards</h3>
                        <p className="text-gray-500 dark:text-gray-400">Your teacher hasn't uploaded any report cards yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reportCards.map((report) => (
                            <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{report.term} Report</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {report.academicYear}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={14} />
                                                {report.classId?.name || 'N/A'}
                                            </span>
                                            <span className={`font-bold ${getGradeColor(report.overallGrade)}`}>
                                                Grade: {report.overallGrade || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(report)}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium flex items-center gap-1"
                                        >
                                            <Eye size={16} />
                                            View Details
                                        </button>
                                        {report.fileUrl && (
                                            <button
                                                onClick={() => handleDownload(report._id)}
                                                className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition text-sm font-medium flex items-center gap-1"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {showModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                {selectedReport.term} Report Card
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Academic Year</p>
                                    <p className="font-semibold">{selectedReport.academicYear}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                                    <p className="font-semibold">{selectedReport.classId?.name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Subjects</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Subject</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Score</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Grade</th>
                                                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {selectedReport.subjects.map((subject, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{subject.name}</td>
                                                    <td className="px-4 py-2">{subject.score}%</td>
                                                    <td className={`px-4 py-2 font-bold ${getGradeColor(subject.grade)}`}>
                                                        {subject.grade}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{subject.remarks || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-4 gap-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                                    <p className="font-bold">{selectedReport.percentage}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                                    <p className={`font-bold ${getGradeColor(selectedReport.overallGrade)}`}>
                                        {selectedReport.overallGrade || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="font-bold">{selectedReport.totalMarks}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Obtained</p>
                                    <p className="font-bold">{selectedReport.totalObtained}%</p>
                                </div>
                            </div>

                            {/* Remarks */}
                            {selectedReport.teacherRemarks && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Teacher Remarks</p>
                                    <p className="text-gray-700 dark:text-gray-200">{selectedReport.teacherRemarks}</p>
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
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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

export default StudentReportCards;