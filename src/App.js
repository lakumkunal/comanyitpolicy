import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddPolicy from './components/AddPolicy';
import EditPolicy from './components/EditPolicy';
import GetPolicy from './components/GetPolicy';
import { ToastContainer } from 'react-toastify';  // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';   // Import the styles for react-toastify
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className='App'>
        <ToastContainer />  {/* Include ToastContainer here */}
        <Routes>
          <Route path='/' element={<AddPolicy />} />
          <Route path='/EditPolicy/:id' element={<EditPolicy />} />
          <Route path='/GetPolicy' element={<GetPolicy />} />
          <Route path='/AddPolicy' element={<AddPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
