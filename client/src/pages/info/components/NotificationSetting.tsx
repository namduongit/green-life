import React from "react";

const NotificationSetting: React.FC = () => {
  // Placeholder for notification settings
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-green-700 mb-2">Nhận thông báo</h2>
      <p className="text-sm text-gray-500 mb-4">Bạn sẽ nhận thông báo về đơn hàng, khuyến mãi và các cập nhật quan trọng.</p>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="notify" className="accent-green-700 w-5 h-5" defaultChecked disabled />
        <label htmlFor="notify" className="text-sm text-gray-700">Nhận thông báo qua email</label>
      </div>
    </div>
  );
};

export default NotificationSetting;
