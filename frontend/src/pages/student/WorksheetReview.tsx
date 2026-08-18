// src/pages/student/WorksheetReview.tsx - View Completed Worksheet with Answers

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Clock,
    FileText,
    Calendar,
    User,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface Answer {
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
}

interface Question {
    question: string;
    options: string[];
    marks: number;
    correctAnswer: number;
}

interface WorksheetResult {
    _id: string;
    worksheetId: {
        _id: string;
        title: string;
        description: string;
    };
    studentId: {
        _id: string;
        name: string;
        email: string;
    };
    answers: Answer[];
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
    startedAt: string;
    submittedAt: string;
    timeSpent: number;
}

const WorksheetReview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [result, setResult] = useState<WorksheetResult | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://kamara-school-backend.onrender.com/api/worksheets/${id}/result`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const data = response.data.data;
                    setResult(data.result);
                    setQuestions(data.questions || []);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching worksheet result:", error);
                setError(getApiErrorMessage(error, "Failed to load worksheet review"));
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
        if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
        if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    };

    const toggleQuestion = (index: number) => {
        setExpandedQuestion(expandedQuestion === index ? null : index);
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading worksheet review...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !result) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <p className="text-xl text-red-600">{error || "Failed to load"}</p>
                        <button
                            onClick={() => navigate('/student/worksheets')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Back to Worksheets
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button & Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student/worksheets')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            Worksheet Review
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">{result.worksheetId?.title || 'Worksheet'}</p>
                    </div>
                </div>

                {/* Score Summary Card */}
                <div className={`rounded-2xl p-6 border-2 ${getScoreBg(result.percentage)} transition-all`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${getScoreColor(result.percentage)}`}>
                                    {result.percentage}%
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Score</p>
                            </div>
                            <div className="w-px h-16 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.score}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.totalMarks - result.score}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Incorrect</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{result.totalMarks}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>Time: {formatTime(result.timeSpent)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>Submitted: {new Date(result.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>{result.studentId?.name || 'Student'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Question Review</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Review your answers and see the correct ones</p>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {questions.map((q, idx) => {
                            const answer = result.answers.find(a => a.questionIndex === idx);
                            const isCorrect = answer?.isCorrect || false;
                            const isExpanded = expandedQuestion === idx;
                            const optionLabels = ['A', 'B', 'C', 'D'];

                            return (
                                <div key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {/* Question Header */}
                                    <button
                                        onClick={() => toggleQuestion(idx)}
                                        className="w-full px-6 py-4 flex items-start gap-4 text-left"
                                    >
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                            isCorrect 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {isCorrect ? (
                                                <CheckCircle size={20} />
                                            ) : (
                                                <XCircle size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                                    Q{idx + 1}: {q.question}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    isCorrect 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {answer ? (
                                                    `Your answer: ${optionLabels[answer.selectedOption] || 'Not answered'}`
                                                ) : (
                                                    'Not answered'
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>

                                    {/* Expanded Answer Details */}
                                    {isExpanded && (
                                        <div className="px-6 pb-4 pt-2">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Options:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isSelected = answer?.selectedOption === optIdx;
                                                        const isCorrectAnswer = q.correctAnswer === optIdx;
                                                        
                                                        let bgColor = 'bg-white dark:bg-gray-800';
                                                        let borderColor = 'border-gray-200 dark:border-gray-600';
                                                        let textColor = 'text-gray-700 dark:text-gray-200';
                                                        
                                                        if (isSelected && isCorrectAnswer) {
                                                            bgColor = 'bg-green-100 dark:bg-green-900/30';
                                                            borderColor = 'border-green-500 dark:border-green-600';
                                                            textColor = 'text-green-700 dark:text-green-400';
                                                        } else if (isSelected && !isCorrectAnswer) {
                                                            bgColor = 'bg-red-100 dark:bg-red-900/30';
                                                            borderColor = 'border-red-500 dark:border-red-600';
                                                            textColor = 'text-red-700 dark:text-red-400';
                                                        } else if (isCorrectAnswer) {
                                                            bgColor = 'bg-green-50 dark:bg-green-900/20';
                                                            borderColor = 'border-green-300 dark:border-green-700';
                                                            textColor = 'text-green-700 dark:text-green-400';
                                                        }
                                                        
                                                        return (
                                                            <div 
                                                                key={optIdx}
                                                                className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor}`}
                                                            >
                                                                <span className="font-bold text-sm">{optionLabels[optIdx]}.</span>
                                                                <span className="flex-1">{opt}</span>
                                                                {isSelected && isCorrectAnswer && (
                                                                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                                                )}
                                                                {isSelected && !isCorrectAnswer && (
                                                                    <XCircle size={18} className="text-red-600 flex-shrink-0" />
                                                                )}
                                                                {!isSelected && isCorrectAnswer && (
                                                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0">✓ Correct Answer</span>
                                                                )}
                                                                {isSelected && (
                                                                    <span className="text-xs font-medium flex-shrink-0">
                                                                        {isCorrectAnswer ? '✓ Your Answer' : '✗ Your Answer'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    Mark: {q.marks} point{q.marks > 1 ? 's' : ''}
                                                    {isCorrect ? ' ✅' : ' ❌'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Legend</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-300">Correct Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500 flex items-center justify-center text-green-700">✓</div>
                            <span className="text-gray-600 dark:text-gray-300">Your Correct Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-500 flex items-center justify-center text-red-700">✗</div>
                            <span className="text-gray-600 dark:text-gray-300">Your Incorrect Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-900/20 border-2 border-green-300"></div>
                            <span className="text-gray-600 dark:text-gray-300">Correct Answer (not selected)</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => navigate('/student/worksheets')}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                        Back to Worksheets
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WorksheetReview;