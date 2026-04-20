import React from "react";

interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ currentPassword, newPassword, confirmPassword, onChange, onSubmit }) => {
  return (
    <form className="grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm text-gray-500">Mật khẩu hiện tại</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => onChange("currentPassword", e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => onChange("newPassword", e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500">Nhập lại mật khẩu</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => onChange("confirmPassword", e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>
      <div className="md:col-span-3">
        <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
          Cập nhật mật khẩu
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;
