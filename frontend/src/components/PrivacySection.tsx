import React from "react";
import BalanceCard from "./BalanceCard";
import Button from "./Button";

const PrivacySection: React.FC = () => {
  return (
    <div className="bg-red-900 text-white p-4 m-2 rounded-lg shadow-md">
      <h1>Privacy section</h1>
      <BalanceCard title="Different amount" balance={7700} />
      <p>
        Manage your privacy settings and review your balance securely. This
        section gives you an overview of your account and ensures your data
        stays safe.
      </p>
      <Button cta="update me" />
    </div>
  );
};

export default PrivacySection;
