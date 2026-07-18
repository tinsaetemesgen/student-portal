export default function Navbar() {
    return (
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium">Admin User</p>
                    <p className="text-sm text-gray-500">Administrator</p>
                </div>

                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    A
                </div>
            </div>
        </header>
    );
}