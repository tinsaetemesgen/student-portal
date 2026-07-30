import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAppContext } from "../context/AppContext";

type Role = "student" | "teacher" | "parent";

interface RegisterFormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: Role;
    className: string;
    age: string;
    parentName: string;
    parentPhone: string;
    subject: string;
    phone: string;
    address: string;
}

const initialForm: RegisterFormState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    className: "",
    age: "",
    parentName: "",
    parentPhone: "",
    subject: "",
    phone: "",
    address: "",
};

const Register = () => {
    const navigate = useNavigate();
    const { setCurrentRole } = useAppContext();
    const [form, setForm] = useState<RegisterFormState>(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const payload: Record<string, string | number> = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
            };

            if (form.role === "student") {
                if (!form.className) {
                    setError("Please select the student's class.");
                    setLoading(false);
                    return;
                }

                payload.class = form.className;
                if (form.age) payload.age = Number(form.age);
                if (form.parentName) payload.parentName = form.parentName;
                if (form.parentPhone) payload.parentPhone = form.parentPhone;
            }

            if (form.role === "teacher") {
                if (!form.subject) {
                    setError("Please provide the teacher's subject.");
                    setLoading(false);
                    return;
                }

                payload.subject = form.subject;
            }

            if (form.phone) payload.phone = form.phone;
            if (form.address) payload.address = form.address;

            const response = await axios.post("http://localhost:7000/api/auth/register", payload);

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));
                setCurrentRole(form.role);
                setSuccess("Account created successfully. Redirecting...");

                setTimeout(() => {
                    switch (form.role) {
                        case "teacher":
                            navigate("/teacher");
                            break;
                        case "parent":
                            navigate("/parent");
                            break;
                        default:
                            navigate("/student");
                    }
                }, 800);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.join(" ") || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-2xl p-6 sm:p-8">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-5">
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-blue-600 text-white">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Create an account</h1>
                        <p className="text-sm text-gray-500">Choose a role and share the details needed for your account.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full rounded-lg border border-gray-300 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-9 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Retype password"
                                className="w-full rounded-lg border border-gray-300 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-9 text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Register as</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>

                    {form.role === "student" && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Class</label>
                                <select
                                    name="className"
                                    value={form.className}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select class</option>
                                    <option value="Grade 9">Grade 9</option>
                                    <option value="Grade 10">Grade 10</option>
                                    <option value="Grade 11">Grade 11</option>
                                    <option value="Grade 12">Grade 12</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    min="1"
                                    max="120"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Parent name</label>
                                <input
                                    type="text"
                                    name="parentName"
                                    value={form.parentName}
                                    onChange={handleChange}
                                    placeholder="Guardian name"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Parent phone</label>
                                <input
                                    type="tel"
                                    name="parentPhone"
                                    value={form.parentPhone}
                                    onChange={handleChange}
                                    placeholder="Guardian phone"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {form.role === "teacher" && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder="Mathematics, English, etc."
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {form.role === "parent" && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Home address"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 ${loading ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
