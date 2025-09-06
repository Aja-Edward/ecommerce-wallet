import React from 'react'


interface BalanceCardProps {
  balance: number;
}

const TonyWalletBalance: React.FC<BalanceCardProps> = ({balance}) => {
  return (
    <div>
        <div className='border border-gray-300 p-2 m-2 rounded-lg shadow-md'>
        <h1 className='text-blue-800'>Wallet Balance</h1>
        <p className='text-2xl font-semibold text-green-600'>${balance.toLocaleString()}</p>
    </div>
    </div>
  )
}

export default TonyWalletBalance