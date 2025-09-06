import './App.css';
import './index.css';
import BalanceCard from './components/BalanceCard';
import TonyWalletBalance from './components/TonyWalletBalance';
function App() {
  return (
    <div className="bg-gray-200 text-blue-700 p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Hello Wallet 🚀</h1>
      <p className="text-lg mb-2">Welcome to your first React app.</p>
      <BalanceCard balance={1000}/>
      <TonyWalletBalance balance={5000}/>
    </div>
  )
}

export default App