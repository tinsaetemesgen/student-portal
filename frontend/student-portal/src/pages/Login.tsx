import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Login = () => {
    const navigate = useNavigate();
    const { schoolInfo, setCurrentRole } = useAppContext();
    const [role, setRole] = useState<"admin" | "teacher" | "student" | "parent">("student");

    const handleLogin = () => {
        setCurrentRole(role);
        if (role === "admin") {
            navigate("/admin");
        } else if (role === "teacher") {
            navigate("/teacher");
        } else if (role === "parent") {
            navigate("/parent");
        } else {
            navigate("/student");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md mx-auto">
                {/* School Logo and Name Preview */}
                <div className="flex flex-col items-center mb-6">
                    {schoolInfo.logo ? (
                        <img
                            src={schoolInfo.logo}
                            alt={schoolInfo.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full border-2 border-blue-200 mb-3"
                        />
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mb-3">
                            {schoolInfo.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
                        {schoolInfo.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{schoolInfo.address}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login as
                    </label>

                    <select
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value as "admin" | "teacher" | "student" | "parent")
                        }
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
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
                    Continue as {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
            </div>
        </div>
    );
};

export default Login;
