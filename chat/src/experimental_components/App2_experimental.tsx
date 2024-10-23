import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigation, useLocation } from 'react-router-dom';
import Phase1 from './Phase1_experimental';
// import Phase2 from './components/Phase2';
// import Phase3 from './components/Phase3';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path='/' element={<Phase1/>} /> */}
      </Routes>
    </Router>
  );
};

export default App;
