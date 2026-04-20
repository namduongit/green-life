import React from "react";

interface MenuProps {
  selected: string;
  onSelect: (key: string) => void;
}

const menuItems = [
  { key: "address", label: "Địa chỉ nhận hàng" },
  { key: "password", label: "Đổi mật khẩu" },
  { key: "notification", label: "Nhận thông báo" },
];

const Menu: React.FC<MenuProps> = ({ selected, onSelect }) => {
  return (
    <div className="rounded-xl w-full border border-gray-200 bg-white p-4 flex flex-col gap-2">
      {menuItems.map((item) => (
        <button
          key={item.key}
          className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${
            selected === item.key
              ? "bg-green-700 text-white"
              : "text-green-700 hover:bg-green-50"
          }`}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Menu;
