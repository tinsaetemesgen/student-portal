import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<"admin" | "teacher" | "student">("student");

    const handleLogin = () => {
        if (role === "admin") {
            navigate("/admin");
        } else if (role === "teacher") {
            navigate("/teacher");
        } else {
            navigate("/student");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Student Portal
                </h1>

                {/* Role Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login As
                    </label>

                    <select
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value as "admin" | "teacher" | "student")
                        }
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
            </div>
        </div>
    );
};

export default Login;