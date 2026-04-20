import React from "react";

interface AddressItem {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  detail: string;
  isPrimary?: boolean;
}

interface AddressListProps {
  addresses: AddressItem[];
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onSetPrimary, onRemove }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <div key={address.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{address.label}</h3>
            {address.isPrimary && <span className="text-xs rounded bg-green-700 px-2 py-0.5 text-white">Mặc định</span>}
          </div>
          <p className="text-sm text-gray-600">{address.recipient} · {address.phone}</p>
          <p className="text-sm text-gray-600">{address.detail}</p>
          <div className="flex flex-wrap gap-3">
            {!address.isPrimary && (
              <button
                type="button"
                onClick={() => onSetPrimary(address.id)}
                className="text-sm font-medium text-green-700 hover:underline"
              >
                Đặt làm mặc định
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(address.id)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Xoá địa chỉ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
