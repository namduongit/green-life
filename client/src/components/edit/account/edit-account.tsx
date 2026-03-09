import { useState, useEffect } from "react";
import { useExecute } from "../../../hooks/execute";
import { updateAccount, type AccountRep } from "../../../services/account";
import ButtonForm from "../../button/button-form/button-form";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

interface EditAccountProps {
    account: AccountRep;
    onClose?: () => void;
    onUpdated?: (updated: AccountRep) => void;
}

const EditAccount = ({ account, onClose, onUpdated }: EditAccountProps) => {
    const { query, loading } = useExecute();
    const { showToast, showErrorResponse } = useToastContext();
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState<boolean>(false);

    const [accountForm, setAccountForm] = useState({
        email: account.email,
        password: "",
        confirmPassword: "",
        role: account.role
    });

    useEffect(() => {
        setAccountForm({
            email: account.email,
            password: "",
            confirmPassword: "",
            role: account.role
        });
    }, [account]);

    const submitForm = async () => {
        if (!accountForm.email.trim()) {
            showToast("Error", "Email không được để trống");
            return;
        }

        if (accountForm.password || accountForm.confirmPassword) {
            if (accountForm.password !== accountForm.confirmPassword) {
                showToast("Error", "Mật khẩu nhập lại không khớp");
                return;
            }

            if (accountForm.password.length < 6) {
                showToast("Error", "Mật khẩu phải ít nhất 6 ký tự");
                return;
            }
        }

        const payload: {
            email: string;
            role: string;
            password?: string;
        } = {
            email: accountForm.email,
            role: accountForm.role
        };

        if (accountForm.password.trim() !== "") {
            payload.password = accountForm.password;
        }

        const result = await query<AccountRep>(updateAccount(account.id, payload));

        if (result?.errors) {
            showErrorResponse(result.errors);
        } else if (result?.data) {
            showToast("Success", "Cập nhật tài khoản thành công!");
            onUpdated?.(result.data);
            setTimeout(() => {
                onClose?.();
            }, 500);
        }
    };

    return (
        <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0 z-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                    <h1 className="text-lg font-semibold text-blue-700">Chỉnh sửa tài khoản</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        x
                    </button>
                </div>

                <div className="px-6 py-6 space-y-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                            Email
                        </label>
                        <div className="px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 flex items-center">
                            <i className="fa-solid fa-envelope text-gray-600"></i>
                            <input
                                id="email"
                                type="email"
                                className="none-input ps-2 py-2 w-full"
                                placeholder="user@example.com"
                                value={accountForm.email}
                                onChange={(event) =>
                                    setAccountForm({ ...accountForm, email: event.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-blue-700 font-medium">
                            Mật khẩu mới (để trống nếu không đổi)
                        </label>
                        <div className="px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 flex items-center">
                            <i className="fa-solid fa-key text-gray-600"></i>
                            <input
                                id="password"
                                type={isShowPassword ? "text" : "password"}
                                className="none-input ps-2 py-2 w-full"
                                placeholder="Tối thiểu 6 ký tự"
                                value={accountForm.password}
                                onChange={(event) =>
                                    setAccountForm({ ...accountForm, password: event.target.value })
                                }
                            />
                            <i
                                className={`fa-solid ${
                                    isShowPassword ? "fa-eye" : "fa-eye-slash"
                                } text-gray-600 cursor-pointer`}
                                onClick={() => setIsShowPassword(!isShowPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="confirmPassword" className="text-blue-700 font-medium">
                            Nhập lại mật khẩu
                        </label>
                        <div className="px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 flex items-center">
                            <i className="fa-solid fa-key text-gray-600"></i>
                            <input
                                id="confirmPassword"
                                type={isShowConfirmPassword ? "text" : "password"}
                                className="none-input ps-2 py-2 w-full"
                                placeholder="Tối thiểu 6 ký tự"
                                value={accountForm.confirmPassword}
                                onChange={(event) =>
                                    setAccountForm({ ...accountForm, confirmPassword: event.target.value })
                                }
                            />
                            <i
                                className={`fa-solid ${
                                    isShowConfirmPassword ? "fa-eye" : "fa-eye-slash"
                                } text-gray-600 cursor-pointer`}
                                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="role" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                            Vai trò
                        </label>
                        <div className="ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700">
                            <select
                                id="role"
                                className="w-full none-input py-2 px-3 text-sm"
                                value={accountForm.role}
                                onChange={(event) =>
                                    setAccountForm({ ...accountForm, role: event.target.value })
                                }
                            >
                                <option value="User">Người dùng</option>
                                <option value="Admin">Quản trị viên</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Hủy bỏ
                    </button>
                    <ButtonForm
                        className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                        onClick={submitForm}
                        inLoading={{ isLoading: loading, textLoading: "Đang cập nhật..." }}
                    >
                        Cập nhật tài khoản
                    </ButtonForm>
                </div>
            </div>
        </div>
    )
}

export default EditAccount;