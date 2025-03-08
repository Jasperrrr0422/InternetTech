import HomePage from './HomePage/HomePage';
import LoginPage from './Login_Register_Page/LoginPage'
import RegisterPage from './Login_Register_Page/RegisterPage'
import HotelDetailPage from './UserPage/HoteldetailPage';
import UserPage from './UserPage/Userpage';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/userpage' element={<UserPage/>}> </Route>
        <Route path='/hotel/:id' element={<HotelDetailPage/>}> </Route>
      </Routes>
    </Router>
  );
}

export default App;
