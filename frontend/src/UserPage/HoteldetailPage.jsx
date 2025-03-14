import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getHotelDetail, createBooking } from "../api";

export default function HotelDetailPage() {
  const { id } = useParams(); // Get hotel ID from URL
  const navigate = useNavigate(); // Navigation function
  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false); // Booking status
  const [error, setError] = useState(null); // Booking error message

  // Fetch hotel details
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

  // Calculate total price based on number of nights
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

  // Handle booking request
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
      console.log("Booking response:", response); // Debugging output

      const orderId = response.id;
      const nights = Math.max(Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)), 0);

      if (orderId) {
        navigate("/payment", {
          state: {
            totalPrice,
            checkIn,
            checkOut,
            guests: bookingData.guests,
            hotelName: hotel?.name,
            address: hotel?.address,
            city: hotel?.city,
            country: hotel?.country,
            pricePerNight: hotel?.price_per_night,
            nights: nights,
            orderId: orderId,
          },
        });
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading text if hotel details are not yet loaded
  if (!hotel) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      {/* Header Section with "Return to Home" Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Hotel Details</h2>
        <button className="btn btn-outline-danger" onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>

      <div className="row">
        {/* Left Section: Hotel Images */}
        <div className="col-md-8">
          <img src={hotel.image} className="imageDetail" alt={hotel.name} />
          <div className="d-flex gap-2">
            {hotel.additional_images?.map((img, index) => (
              <img key={index} src={img} className="img-thumbnail" alt="Hotel Extra" width="150px" />
            ))}
          </div>
        </div>

        {/* Right Section: Hotel Info + Booking Form */}
        <div className="col-md-4">
          <h2>{hotel.name}</h2>
          <p>
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
          <p>
            <strong>Amenities:</strong>{" "}
            {hotel.amentities?.map((amenity, index) => (
              <span key={index} className="badge bg-secondary me-1">{amenity.name}</span>
            ))}
          </p>
          <p>
            {hotel.guests} Guests • {hotel.total_rooms} Rooms • {hotel.total_beds} Beds
          </p>
          <p className="fw-bold">⭐ {hotel.rating} / 5</p>
          <p>Host by <strong>{hotel.owner_name}</strong></p>

          <div className="border p-3 rounded bg-light">
            <h4>${hotel.price_per_night} / night</h4>
            <div className="d-flex">
              <input type="date" className="form-control me-2" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <input type="number" className="form-control mt-2" value={guests} min="1" onChange={(e) => setGuests(e.target.value)} placeholder="Choose Guest" />

            {/* Show error message if any */}
            {error && <p className="text-danger mt-2">{error}</p>}

            {/* Booking Button */}
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

      {/* Comment Section */}
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