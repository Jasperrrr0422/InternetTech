import HomePage from './HomePage/HomePage';
import LoginPage from './Login_Register_Page/LoginPage'
import RegisterPage from './Login_Register_Page/RegisterPage'
import PaymentPage from './Payment/PaymentPage';
import HotelDetailPage from './UserPage/HoteldetailPage';
import UserPage from './UserPage/Userpage';
import OwnermainPage from './OwnerPage/OwnerMainPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostHotelInfo from './OwnerPage/PostHotelInfo';
import OrderHistoryPage from './UserPage/OrderHistoryPage' ;
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/userpage' element={<UserPage/>}> </Route>
        <Route path='/hotel/:id' element={<HotelDetailPage/>}> </Route>
        <Route path='/payment' element={<PaymentPage/>}> </Route>
        <Route path='/owenermainpage' element={<OwnermainPage/>}> </Route>
        <Route path='/ownerupload' element={<PostHotelInfo/>}> </Route>
        <Route path='/order-history' element={<OrderHistoryPage/>}> </Route>
      </Routes>
    </Router>
  );
}

export default App;
