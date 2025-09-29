import React from "react";
import Button from "./Button";

interface BalanceCardProps {
  balance: number;
  title: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, title }) => {
  return (
    <div className="bg-white border border-gray-200 p-6 m-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h1 className="text-lg font-medium text-gray-700 mb-2">{title}</h1>
      <p className="text-3xl font-bold text-green-600 mb-4">
        ${balance.toLocaleString()}
      </p>
      <Button cta="Top Up" />
    </div>
  );
};

export default BalanceCard;
