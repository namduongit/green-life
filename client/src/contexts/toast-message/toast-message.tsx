import { createContext, useContext, useState } from "react";

const ToastMessageContext = createContext<{
    showToast: (type: "Success" | "Fail" | "Error" | "Note", message: string) => void
}>({
    showToast: () => { }
});

const ToastMessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<{
        id: number,
        type: "Success" | "Fail" | "Error" | "Note",
        message: string
    }[]>([]);

    const showToast = (type: "Success" | "Fail" | "Error" | "Note", message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, {
            id: id,
            type: type,
            message: message
        }]);

        setTimeout(() => closeToast(id), 3000);
    }

    const closeToast = (id: number) => {
        setToasts(toasts.filter(toast => toast.id !== id))
    }

    const getTextColor = (type: "Success" | "Fail" | "Error" | "Note") => {
        return type === "Success" ? "text-green-700" :
            type === "Fail" ? "text-yellow-700" :
                type === "Error" ? "text-red-700" : "text-blue-700";
    }

    const getBorderColor = (type: "Success" | "Fail" | "Error" | "Note") => {
        return type === "Success" ? "border-green-700" :
            type === "Fail" ? "border-yellow-600" :
                type === "Error" ? "border-red-600" : "border-blue-600";
    }

    const getBackgroundColor = (type: "Success" | "Fail" | "Error" | "Note") => {
        return type === "Success" ? "bg-green-100" :
            type === "Fail" ? "bg-yellow-100" :
                type === "Error" ? "bg-red-100" : "bg-blue-100";
    }

    return (
        <ToastMessageContext.Provider value={{ showToast }}>
            <div className="fixed top-5 end-5 w-60 h-15 z-12">
                {toasts && toasts.map((toast, idx) => (
                    <div key={idx} className={`flex items-center ${getBackgroundColor(toast.type)} 
                        left-to-right shadow px-3 py-3 gap-2 border-s-4 ${getBorderColor(toast.type)}`}>
                        <div>
                            <div className={`w-4 h-4 rounded-full border-4 ${getBorderColor(toast.type)}`}></div>
                        </div>
                        <div className={`flex-1 ${getTextColor(toast.type)}`}>
                            <div className="flex justify-between">
                                <h1 className="font-semibold text-lg">
                                    {toast.type === "Success" && "Thành công"}
                                    {toast.type === "Fail" && "Thất bại"}
                                    {toast.type === "Error" && "Lỗi"}
                                    {toast.type === "Note" && "Thông báo"}
                                </h1>
                                <button className="text-gray-500" onClick={() => closeToast(toast.id)}>x</button>
                            </div>
                            <p className="text-sm">{toast.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {children}
        </ToastMessageContext.Provider>
    )
}

const useToastContext = () => {
    const ctx = useContext(ToastMessageContext);
    if (!ctx) throw new Error("Require Toast Message Context");
    return ctx;
}

export { ToastMessageProvider, useToastContext }