import DashboardLayout from "../../layout/DashboardLayout";

const Students = () => {
    return (
        <DashboardLayout role="admin">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Students Management
                </h1>
                <p className="text-gray-500">
                    This page will contain the students table, search, pagination, and add student modal.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default Students;