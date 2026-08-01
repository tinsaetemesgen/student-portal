import { useState, useEffect, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { X, Check } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";

const outstandingFees = [
    { title: "Tuition", amount: "15,000 ETB" },
    { title: "Library", amount: "500 ETB" },
];

const paymentHistory = [
    { title: "Tuition", amount: "5,000 ETB", status: "Paid" },
    { title: "Registration", amount: "2,000 ETB", status: "Paid" },
];

const paymentMethods = [
    { id: "cbe", name: "CBE", icon: "🏦" },
    { id: "telebirr", name: "Telebirr", icon: "📱" },
    { id: "awash", name: "Awash Bank", icon: "🏦" },
    { id: "dashen", name: "Dashen Bank", icon: "🏦" },
    { id: "mpesa", name: "M-Pesa", icon: "📱" },
];

const ParentPayments = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowModal(false);
        };
        if (showModal) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [showModal]);

    const handleReceiptUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setReceipt(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedMethod(null);
        setTransactionId("");
        setReceipt(null);
        setPreview(null);
    };

    const handleContinuePayment = () => {
        if (!selectedMethod) return;

        console.log({
            paymentMethod: selectedMethod,
            transactionId,
            receipt,
        });

        alert("Payment submitted for verification.");

        handleClose();

        setTransactionId("");
        setReceipt(null);
        setPreview(null);
    };

    const modalContent = showModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Select Payment Method</h2>
                    <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5">

                    <p className="text-sm text-gray-500 mb-5">
                        Select your payment method.
                    </p>

                    <div className="space-y-3 mb-6">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${selectedMethod === method.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="text-2xl">{method.icon}</span>

                                <span className="flex-1 text-left font-medium">
                                    {method.name}
                                </span>

                                {selectedMethod === method.id && (
                                    <Check size={18} className="text-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    {selectedMethod && (
                        <div className="space-y-4 border-t pt-5">

                            <div className="rounded-lg bg-gray-50 p-4 border">
                                <p className="text-sm text-gray-500">
                                    Transfer payment using the selected method, then submit the details below.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Transaction ID
                                </label>

                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Payment Screenshot
                                </label>

                                <label
                                    htmlFor="receipt-upload"
                                    className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-500 transition"
                                >
                                    {!preview ? (
                                        <>
                                            <UploadCloud
                                                size={52}
                                                className="text-blue-500 mb-3"
                                            />

                                            <p className="font-semibold text-gray-700">
                                                Click to upload receipt
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                PNG, JPG or JPEG
                                            </p>
                                        </>
                                    ) : (
                                        <img
                                            src={preview}
                                            alt="Receipt Preview"
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                    )}
                                </label>

                                <input
                                    id="receipt-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleReceiptUpload}
                                    className="hidden"
                                />

                                {preview && (
                                    <p className="mt-2 text-sm text-green-600 font-medium">
                                        ✓ Receipt uploaded successfully. Click the image to change it.
                                    </p>
                                )}
                            </div>

                        </div>
                    )}

                </div>

                <div className="flex justify-end gap-3 p-5 border-t">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleContinuePayment}
                        disabled={
                            !selectedMethod ||
                            !transactionId.trim() ||
                            !receipt
                        }
                        className={`px-4 py-2 rounded-lg transition font-medium ${selectedMethod
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Submit for Verification
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Outstanding Balance</h1>
                            <p className="text-gray-500">Review your child's current school dues.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                            Pay Now
                        </button>
                    </div>

                    <div className="mt-6 grid gap-3">
                        {outstandingFees.map((fee) => (
                            <div key={fee.title} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                <span className="font-medium text-gray-700">{fee.title}</span>
                                <span className="font-semibold text-gray-900">{fee.amount}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500">Total Due</p>
                        <p className="text-3xl font-bold text-gray-900">15,500 ETB</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold">Payment History</h2>
                    <div className="mt-4 space-y-3">
                        {paymentHistory.map((record) => (
                            <div key={record.title} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                <div>
                                    <p className="font-medium text-gray-800">{record.title}</p>
                                    <p className="text-sm text-gray-500">Completed payment</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{record.amount}</p>
                                    <p className="text-sm text-gray-600">✓ {record.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {modalContent}
        </DashboardLayout>
    );
};

export default ParentPayments;
