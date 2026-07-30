import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Mail } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ForgotPassword = () => {
    const { schoolInfo } = useAppContext();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axios.post(
                "http://localhost:7000/api/auth/forgot-password",
                { email }
            );

            setMessage(res.data.message || "Password reset instructions have been sent.");
        } catch (err: any) {
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-8">

                <div className="flex flex-col items-center mb-6">
                    {schoolInfo.logo ? (
                        <img
                            src={schoolInfo.logo}
                            alt={schoolInfo.name}
                            className="w-20 h-20 rounded-full object-contain border-2 border-blue-200 mb-3"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-3">
                            {schoolInfo.name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-gray-800">
                        Forgot Password
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 text-center">
                        Enter your email address and we'll send you password reset steps.
                    </p>
                </div>

                {message && (
                    <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="relative mb-5">
                        <Mail
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;





