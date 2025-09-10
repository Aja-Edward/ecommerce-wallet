import React from 'react'
import BalanceCard from './BalanceCard'
import Button from './Button';

interface SampleProps {
  description: string;
}


const Sample: React.FC<SampleProps> = ({ description }) => {
  return (
    <div className='bg-gray-800 text-white p-4 m-2 rounded-lg shadow-md'>
        <h1>Looking up for the balance of our recent customer</h1>
        <BalanceCard title='Sample Wallet' balance={2500} />
        <p>{description}</p>
        <Button cta="Click Me" />
    </div>
  )
}

export default Sample