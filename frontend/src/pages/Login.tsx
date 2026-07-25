import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";


type Role = "admin" | "registrar" | "finance_officer" | "teacher" | "student" | "parent";

const Login = () => {
    const navigate = useNavigate();
    const { schoolInfo, setCurrentRole } = useAppContext();
    const [role, setRole] = useState<Role>("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:7000/api/auth/login", {
                email,
                password,
            });

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));

                const userRole = response.data.data.role;
                setCurrentRole(userRole);

                switch (userRole) {
                    case "admin":
                        navigate("/admin");
                        break;
                    case "registrar":
                        navigate("/registrar");
                        break;
                    case "finance_officer":
                        navigate("/finance");
                        break;
                    case "teacher":
                        navigate("/teacher");
                        break;
                    case "student":
                        navigate("/student");
                        break;
                    case "parent":
                        navigate("/parent");
                        break;
                    default:
                        navigate("/");
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md mx-auto">
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

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login as
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="admin">Admin</option>
                        <option value="registrar">Registrar</option>
                        <option value="finance_officer">Finance Officer</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="mb-4 text-center">
                    <Link
                        to="./forgot-password"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "Logging in..." : `Continue as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                    <p className="font-medium">🔑 Demo Credentials</p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        <div className="text-left">Admin:</div>
                        <div className="text-right">admin@gmail.com / password123</div>
                        <div className="text-left">Registrar:</div>
                        <div className="text-right">reg@gmail.com / password123</div>
                        <div className="text-left">Finance:</div>
                        <div className="text-right">fin@gmail.com / password123</div>
                        <div className="text-left">Teacher:</div>
                        <div className="text-right">helen@school.com / password123</div>
                        <div className="text-left">Student:</div>
                        <div className="text-right">abebe@school.com / password123</div>
                        <div className="text-left">Parent:</div>
                        <div className="text-right">kebede@email.com / password123</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;