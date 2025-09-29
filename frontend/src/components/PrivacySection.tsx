// import React from "react";
// import Button from "./Button";

// const Privacy: React.FC = () => {
//   return (
//     <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10">
//       {/* Page Title */}
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>

//       {/* Section 1 */}
//       <section className="mb-6">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">Introduction</h2>
//         <p className="text-gray-600 leading-relaxed">
//           We respect your privacy and are committed to protecting your personal data. 
//           This Privacy Policy explains how we collect, use, and safeguard your information 
//           when you use our services.
//         </p>
//       </section>

//       {/* Section 2 */}
//       <section className="mb-6">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">Information We Collect</h2>
//         <ul className="list-disc pl-6 text-gray-600 space-y-1">
//           <li>Personal information you provide (e.g., name, email, account details).</li>
//           <li>Transaction data related to your use of our platform.</li>
//           <li>Technical data such as IP address, browser type, and device information.</li>
//         </ul>
//       </section>

//       {/* Section 3 */}
//       <section className="mb-6">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">How We Use Your Data</h2>
//         <p className="text-gray-600 leading-relaxed">
//           We use your data to provide secure transactions, improve our services, 
//           personalize your experience, and comply with legal obligations.
//         </p>
//       </section>

//       {/* Section 4 */}
//       <section className="mb-6">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Rights</h2>
//         <p className="text-gray-600 leading-relaxed">
//           You have the right to access, update, or delete your personal data at any time. 
//           Contact us if you wish to exercise these rights.
//         </p>
//       </section>

//       {/* CTA */}
//       <div className="mt-8 flex justify-center">
//         <Button cta="Back to Home" onClick={() => alert("Navigate to Home")} />
//       </div>
//     </div>
//   );
// };

// export default Privacy;


import React from "react";
import BalanceCard from "./BalanceCard";
import Button from "./Button";

const Privacy: React.FC = () => {
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

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our services.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Information We Collect</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Personal information you provide (e.g., name, email, account details).</li>
              <li>Transaction data related to your use of our platform.</li>
              <li>Technical data such as IP address, browser type, and device information.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">How We Use Your Data</h2>
            <p className="text-gray-600 leading-relaxed">
              We use your data to provide secure transactions, improve our services, 
              personalize your experience, and comply with legal obligations.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal data at any time. 
              Contact us if you wish to exercise these rights.
            </p>
          </section>

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
