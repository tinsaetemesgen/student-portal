import DashboardLayout from "../../layout/DashboardLayout";

const AdminGrades = () => {
    return (
        <DashboardLayout role="admin">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800">Grade Overview</h1>
                <p className="text-gray-500 mt-1">Manage grade reports and academic progress from here.</p>
            </div>
        </DashboardLayout>
    );
};

export default AdminGrades;
