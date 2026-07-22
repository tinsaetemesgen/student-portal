import DashboardLayout from "../../layout/DashboardLayout";

const StudentFees = () => {
    const isPaid = false;

    return (
        <DashboardLayout role="student">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800">Outstanding Balance</h1>
                <p className="text-gray-500 mt-1">This view is read-only for students.</p>

                <div className="mt-6 rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-500">Total Due</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">15,500 ETB</p>

                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        {isPaid ? (
                            <p className="text-lg font-semibold text-gray-600">✅ Fully Paid</p>
                        ) : (
                            <p className="text-lg font-semibold text-gray-600">❌ Unpaid</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentFees;
