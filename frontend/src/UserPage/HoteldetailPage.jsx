import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHotelDetail } from "../api";

export default function HotelDetailPage() {
  const { id } = useParams(); 
  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [checkIn, checkOut, guests]);

  const fetchHotelDetails = async () => {
    try {
      const data = await getHotelDetail(id);
      setHotel(data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(
      Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)), 0
    );

    setTotalPrice(nights * (hotel?.price_per_night || 0));
  };

  if (!hotel) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      {/* property image */}
      <div className="row">
        <div className="col-md-8">
          <img src={hotel.image} className="imageDetail" alt={hotel.name} />
          <div className="d-flex gap-2">
            {hotel.additional_images?.map((img, index) => (
              <img key={index} src={img} className="img-thumbnail" alt="Hotel Extra" width="150px" />
            ))}
          </div>
        </div>

        {/* Right information */}
        <div className="col-md-4">
          <h2>{hotel.name}</h2>
          <p>{hotel.address}, {hotel.city}, {hotel.country}</p>
          <p>{hotel.guests} Guests • {hotel.beds} Beds • {hotel.bathrooms} Bathrooms</p>
          <p className="fw-bold">⭐ {hotel.rating} / 5</p>
          <p>Host by <strong>{hotel.owner}</strong></p>

          {/* Reservation form */}
          <div className="border p-3 rounded bg-light">
            <h4>${hotel.price_per_night} / night</h4>
            <div className="d-flex">
              <input type="date" className="form-control me-2" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <input type="number" className="form-control mt-2" value={guests} min="1" onChange={(e) => setGuests(e.target.value)} placeholder="Choose Guest" />
            <button className="btn btn-primary w-100 mt-3">Reserve</button>
            <p className="mt-2 text-center">${hotel.price_per_night} x {Math.max(Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)), 0)} nights</p>
            <h5 className="text-end">Total: ${totalPrice}</h5>
          </div>
        </div>
      </div>

      {/* Comment part */}
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