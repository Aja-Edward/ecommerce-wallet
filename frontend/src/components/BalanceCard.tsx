import React from 'react'
import Button from './Button';

interface BalanceCardProps {
  balance: number;
  title: string;
}


const BalanceCard: React.FC<BalanceCardProps> = ({ balance, title }) => {
  return (
    <div className='border border-gray-300 p-2 m-2 rounded-lg shadow-md'>
        <h1 className='text-blue-800'>{title}</h1>
        <p className='text-2xl font-semibold text-green-600'>${balance.toLocaleString()}</p>
        <Button cta="Top Up" />
    </div>
  )
}

export default BalanceCard