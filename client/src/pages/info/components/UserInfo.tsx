import React from "react";

interface UserInfoProps {
  email: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ email }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 flex flex-col items-center gap-6">
      <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-6xl text-green-700 shadow">
        <i className="fa-solid fa-user-circle"></i>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-green-800 break-all">{email}</p>
      </div>
    </div>
  );
};

export default UserInfo;
