import { createContext, useContext, useState } from "react";

const ModalConfirmContext = createContext<{
    waitConfirm: () => Promise<boolean>
}>({
    waitConfirm: () => Promise.resolve(false)
});

const ModalConfirmProvider = ({ children }: { children: React.ReactNode }) => {
    const [modal, setModal] = useState<{
        resolve: (v: boolean) => void
    } | null>(null);

    const waitConfirm = () => {
        return new Promise<boolean>((resolve) => {
            setModal({ resolve: resolve });
        })
    }

    const handleConfirm = () => {
        modal?.resolve(true);
        setModal(null);
    }

    const handleCancel = () => {
        modal?.resolve(false);
        setModal(null)
    }

    return (
        <ModalConfirmContext.Provider value={{ waitConfirm }}>
            {modal && (
                <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0">
                    <div className="w-100 h-48 bg-white rounded flex flex-col">
                        <div className="flex justify-between px-3 py-2 border-b border-gray-300">
                            <div className="flex gap-1 items-center">
                                <i className="fa-solid fa-circle-question"></i>
                                <h1>Xác nhận hành động này ?</h1>
                            </div>
                            <button>x</button>
                        </div>
                        <div className="px-3 pt-3 flex-1">
                            <p>Khi xác nhận hành động này bạn sẽ không thể quay lại hành động trước.
                                Suy nghĩ kỹ trước khi ấn <strong>Xác nhận</strong>
                            </p>
                        </div>
                        <div className="px-3 pb-3 flex justify-end gap-3">
                            <button className="px-2 py-1 text-black bg-white ring-1 ring-gray-800 rounded 
                            text-sm" onClick={handleCancel}>Hủy bỏ</button>
                            <button className="px-2 py-1 text-white bg-green-700 rounded text-sm ring-1 ring-green-700 
                            hover:ring-2 hover:bg-white hover:text-green-700 transition-all font-semibold" onClick={handleConfirm}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </ModalConfirmContext.Provider>
    )
}

const useModalConfirmContext = () => {
    const ctx = useContext(ModalConfirmContext);
    if (!ctx) throw new Error("Require Modal Confirm Context")
    return ctx;
}

export { ModalConfirmProvider, useModalConfirmContext }