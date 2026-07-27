// src/pages/student/WorksheetAttempt.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Question {
    question: string;
    options: string[];
    marks: number;
}

interface AttemptData {
    attempt: {
        _id: string;
        startedAt: string;
    };
    questions: Question[];
    totalMarks: number;
    totalQuestions: number;
    duration: number;
}

const WorksheetAttempt = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<AttemptData | null>(null);
    const [answers, setAnswers] = useState<{ questionIndex: number; selectedOption: number }[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchAttempt();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchAttempt = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:7000/api/worksheets/${id}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data.data);
            setAnswers(response.data.data.attempt.answers.map((a: any) => ({
                questionIndex: a.questionIndex,
                selectedOption: a.selectedOption,
            })));

            // Calculate time left
            const startedAt = new Date(response.data.data.attempt.startedAt);
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            const durationSeconds = response.data.data.duration * 60;
            const remaining = Math.max(0, durationSeconds - elapsed);
            setTimeLeft(remaining);

            // Start timer
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching attempt:", error);
            setError(error.response?.data?.error || "Failed to load worksheet");
            setLoading(false);
        }
    };

    const handleAutoSubmit = async () => {
        if (isSubmitting) return;
        alert("⏰ Time's up! Auto-submitting your answers...");
        await handleSubmit();
    };

    const handleSelectOption = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.questionIndex === questionIndex);
            if (existing) {
                return prev.map(a =>
                    a.questionIndex === questionIndex
                        ? { ...a, selectedOption: optionIndex }
                        : a
                );
            }
            return [...prev, { questionIndex, selectedOption: optionIndex }];
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!window.confirm("Are you sure you want to submit? You cannot change your answers after submission.")) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:7000/api/worksheets/${id}/submit`,
                { answers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (timerRef.current) clearInterval(timerRef.current);
            const result = response.data.data;
            alert(`✅ Submitted! You scored ${result.score}/${result.totalMarks} (${result.percentage}%)`);
            navigate('/student/worksheets');
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to submit");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading worksheet...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !data) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error || "Failed to load"}</div>
                </div>
            </DashboardLayout>
        );
    }

    const answeredCount = answers.filter(a => a.selectedOption >= 0).length;

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student/worksheets')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Worksheet</h1>
                            <p className="text-gray-500">{data.totalQuestions} questions • {data.totalMarks} marks</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Progress</p>
                            <p className="text-sm font-semibold">{answeredCount}/{data.totalQuestions}</p>
                        </div>
                        <div className={`text-center ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                            <p className="text-xs text-gray-500">Time Left</p>
                            <p className="text-lg font-bold">{formatTime(timeLeft)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    {data.questions.map((q, idx) => (
                        <div key={idx} className={`border-b last:border-0 py-4 ${idx > 0 ? 'border-gray-100' : ''}`}>
                            <div className="flex items-start gap-2 mb-2">
                                <span className="font-medium text-gray-700">Q{idx + 1}.</span>
                                <span className="text-gray-800">{q.question}</span>
                                <span className="text-xs text-gray-400 ml-auto">({q.marks} mark{q.marks > 1 ? 's' : ''})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = answers.find(a => a.questionIndex === idx)?.selectedOption === optIdx;
                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelectOption(idx, optIdx)}
                                            className={`text-left px-4 py-2 rounded-lg border transition ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                                            <span className="ml-2">{opt}</span>
                                            {isSelected && <CheckCircle size={16} className="inline ml-2 text-blue-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Worksheet'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WorksheetAttempt;