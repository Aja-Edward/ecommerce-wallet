import React from 'react'

interface ButtonProps {
  cta: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ cta }) => {
  return (
    <div className='bg-gray-500 rounded-md shadow-lg text-black w-25 h-14 text-center p-4'>{cta}</div>
  )
}

export default Button