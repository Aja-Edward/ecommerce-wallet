// import React from 'react'
// import Cards from '../../components/userdashboard/Cards'

// const CardsPage = () => {
//   return (
//     <div>
//         <Cards />
//     </div>
//   )
// }

// export default CardsPage

import Cards from '../../components/userdashboard/Cards';
import { CardProvider } from '../../context/CardContext';

const CardsPage = () => {
  return (
    <CardProvider>
      <Cards />
    </CardProvider>
  );
};

export default CardsPage;