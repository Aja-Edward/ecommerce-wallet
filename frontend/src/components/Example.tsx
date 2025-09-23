import React from 'react'

const valuables = [
    'diamond', 
    'gold', 
    'silver', 
    'platinum', 
    'ruby', 
    'sapphire',  
    'plastic', 
    'wood', 
    'stone', 
    'glass', 
    'paper', 
    'cloth', 
    'cotton', 
    'leather', 
    'iron', 
    'copper', 
    'bronze', 
    'steel', 
    'aluminum', 
    'titanium',   
]

const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']

valuables.push('nickel')
valuables.pop()
valuables.shift()
valuables.unshift('Carbon')
console.log(valuables)
console.log(valuables.length)
console.log(valuables[16])

valuables.filter(valuable => valuable.startsWith('s')).forEach(valuable => console.log(valuable))
valuables.reduce((acc, valuable) => acc + valuable.length, 0)

const Example = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Valuables List</h2>
        <ul className="list-disc list-inside text-gray-300">
            {names.map((valuable, index) => (
                <li key={index}>{valuable}</li>
            ))}
        </ul>
    </div>
  )
}

export default Example