import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getHotelDetail, createBooking,createPaypalPayment } from "../api";

export default function HotelDetailPage() {
  const { id } = useParams(); // 获取URL中的酒店ID
  const navigate = useNavigate(); // 页面跳转
  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false); // 预订状态
  const [error, setError] = useState(null); // 预订错误信息

  // 获取酒店详情
  const fetchHotelDetails = useCallback(async () => {
    try {
      const data = await getHotelDetail(id);
      setHotel(data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchHotelDetails();
  }, [fetchHotelDetails]);

  // 计算总价
  const calculateTotalPrice = useCallback(() => {
    if (!checkIn || !checkOut) return;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)), 0);
    setTotalPrice(nights * (hotel?.price_per_night || 0));
  }, [checkIn, checkOut, hotel?.price_per_night]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  // 处理预订请求
  const handleReserve = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const bookingData = {
        hotel: parseInt(id, 10),
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests: parseInt(guests, 10) || 1,
      };
      console.log(bookingData);
      const response = await createBooking(bookingData);
      console.log("Booking response:", response); // Add this for debugging
  
      const orderId = response.id;
  
      if (orderId) {
        const paymentResponse = await createPaypalPayment(orderId);
        if (paymentResponse.status === 200) {
          navigate("/payment", {
            state: {
              totalPrice,
              checkIn,
              checkOut,
              guests: bookingData.guests,
              hotelName: hotel?.name,
              orderId: orderId,
            },
          });
        } else {
          throw new Error("Payment creation failed");
        }
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (err) {
      console.error("Booking failed:", err); // Add this for debugging
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (!hotel) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* 左侧：酒店图片 */}
        <div className="col-md-8">
          <img src={hotel.image} className="imageDetail" alt={hotel.name} />
          <div className="d-flex gap-2">
            {hotel.additional_images?.map((img, index) => (
              <img key={index} src={img} className="img-thumbnail" alt="Hotel Extra" width="150px" />
            ))}
          </div>
        </div>

        {/* 右侧：酒店信息 + 预订表单 */}
        <div className="col-md-4">
          <h2>{hotel.name}</h2>
          <p>
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
          <p>
            {hotel.guests} Guests • {hotel.beds} Beds • {hotel.bathrooms} Bathrooms
          </p>
          <p className="fw-bold">⭐ {hotel.rating} / 5</p>
          <p>Host by <strong>{hotel.owner}</strong></p>

          <div className="border p-3 rounded bg-light">
            <h4>${hotel.price_per_night} / night</h4>
            <div className="d-flex">
              <input type="date" className="form-control me-2" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <input type="number" className="form-control mt-2" value={guests} min="1" onChange={(e) => setGuests(e.target.value)} placeholder="Choose Guest" />

            {/* 显示错误信息 */}
            {error && <p className="text-danger mt-2">{error}</p>}

            {/* 预订按钮 */}
            <button className="btn btn-primary w-100 mt-3" onClick={handleReserve} disabled={loading}>
              {loading ? "Processing..." : "Reserve"}
            </button>

            <p className="mt-2 text-center">
              ${hotel.price_per_night} x {Math.max(Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)), 0)} nights
            </p>
            <h5 className="text-end">Total: ${totalPrice}</h5>
          </div>
        </div>
      </div>

      {/* 评论区 */}
      <div className="mt-4">
        <h3>Comments</h3>
        <div className="mb-3">
          <input type="text" className="form-control mb-2" placeholder="Your name" />
          <textarea className="form-control mb-2" rows="3" placeholder="Post your comments"></textarea>
          <button className="btn btn-secondary">Submit</button>
        </div>
      </div>
    </div>
  );
}