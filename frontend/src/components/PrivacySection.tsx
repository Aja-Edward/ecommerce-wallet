import React from "react";
import BalanceCard from "./BalanceCard";
import Button from "./Button";
import type { PrivacyPolicySection } from "../types/auth.types";
import { privacyData } from "../assets/data/privacyData";

const Privacy: React.FC<PrivacyPolicySection> = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-12 px-4">
      {/* 🌈 Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-[length:400%_400%]"></div>

      {/* Page Content */}
      <div className="relative z-10 max-w-5xl w-full space-y-8">
        {/* Balance Cards */}
        <div className="flex flex-col md:flex-row gap-6">
          <BalanceCard title="Main Balance" balance={1250} />
          <BalanceCard title="Savings Balance" balance={3200} />
        </div>

        {/* Privacy Card */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>

          {privacyData.map((section, index) => (
            <section key={index} className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{section.title}</h2>
              
              {/* {section.title && (
                <p className="text-gray-600 leading-relaxed">
                  {section.title}
                </p>
              )} */}

              {section.items && (
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}

              {section.content && (
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              )}
            </section>
          ))}

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Button cta="Back to Home" onClick={() => (window.location.href = "/")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;