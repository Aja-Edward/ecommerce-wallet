import React from "react";
import BalanceCard from "./BalanceCard";
import Button from "./Button";

interface PrivacySectionProps {
  description: string;
  title: string;
}
const PrivacySection: React.FC<PrivacySectionProps> = ({description, title}) => {
  return (
    <div className="bg-red-900 text-white p-4 m-2 rounded-lg shadow-md">
      <h1>{title}</h1>
      <BalanceCard title="Different amount" balance={7700} />
      <p>
        {description}
      </p>
      <Button cta="update me" />
    </div>
  );
};

export default PrivacySection;
