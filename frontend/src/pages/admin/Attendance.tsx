import DashboardLayout from "../../layout/DashboardLayout";

const AdminAttendance = () => {
    return (
        <DashboardLayout role="admin">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800">Attendance Overview</h1>
                <p className="text-gray-500 mt-1">Monitor daily and weekly attendance status for the school.</p>
            </div>
        </DashboardLayout>
    );
};

export default AdminAttendance;
