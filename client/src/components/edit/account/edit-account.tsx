import type { AccountRep } from "../../../services/account";
import { useState, useEffect } from "react";
import { updateAccount } from "../../../services/account/account";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

type Props = {
    account: AccountRep;
    onClose: () => void;
    onUpdated: (updated: AccountRep) => void;
};

const EditAccount = ({ account, onClose, onUpdated }: Props) => {
    const [email, setEmail] = useState(account.email);
    const [role, setRole] = useState(account.role);
    const { showToast, showErrorResponse } = useToastContext();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        setEmail(account.email);
        setRole(account.role);
        setPassword("");
        setConfirmPassword("");
        setError("");
    }, [account]);

    const handleSubmit = async () => {
        setError("");

        if (!email.trim()) {
            setError("Email không được để trống");
            return;
        }

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                setError("Mật khẩu nhập lại không khớp");
                return;
            }

            if (password.length < 6) {
                setError("Mật khẩu phải ít nhất 6 ký tự");
                return;
            }
        }

        const payload: {
            email: string;
            role: string;
            password?: string;
        } = {
            email,
            role
        };

        if (password.trim() !== "") {
            payload.password = password;
        }

        const result = await updateAccount(account.id, payload);

        if (result?.data) {
            onUpdated({ ...account, email, role });
            showToast("Success", "Cập nhật tài khoản thành công");
            onClose();
        } else {
            showErrorResponse("Cập nhật thất bại");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded w-96">
                <h2 className="text-lg font-semibold mb-4">Chỉnh sửa tài khoản</h2>

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full mb-3"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 w-full mb-4"
                >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                </select>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 w-full mb-3"
                />

                <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border p-2 w-full mb-3"
                />

                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Hủy</button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAccount;