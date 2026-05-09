// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './user/pages/Login';
import Home from './user/pages/Home';
import UpdateProfile from './user/pages/UpdateProfile';
import ViewQr from './user/pages/ViewQr';
import SelectLayout from './user/pages/SelectLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/updateprofile" element={<UpdateProfile />} />
        <Route path="/viewqr" element={<ViewQr />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;