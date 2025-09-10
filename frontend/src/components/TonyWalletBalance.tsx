import React from 'react'
import Button from './Button';


interface BalanceCardProps {
  balance: number;
}

const TonyWalletBalance: React.FC<BalanceCardProps> = ({balance}) => {
  return (
    <div>
        <div className='border border-gray-300 p-2 m-2 rounded-lg shadow-md'>
        <h1 className='text-blue-800'>Wallet Balance</h1>
        <p className='text-2xl font-semibold text-green-600'>${balance.toLocaleString()}</p>
        <Button cta="Top Down" />
    </div>
    </div>
  )
}

export default TonyWalletBalance