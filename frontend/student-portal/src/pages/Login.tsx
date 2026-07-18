import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Student Portal
                </h1>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full border p-3 rounded-lg mb-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded-lg mb-6"
                />

                <button
                    onClick={() => navigate("/admin")}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                    Login (Demo)
                </button>
            </div>
        </div>
    );
}