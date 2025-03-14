import { Link } from "react-router-dom";

export default function HotelList({ hotels, isOwner }) {
  if (!hotels.length) return <p>No hotels found</p>;

  return (
    <div className="row row-cols-1 row-cols-md-3 g-4 listings-container">
      {hotels.map((hotel) => (
        <div className="col" key={hotel.id}>
          <Link to={isOwner ? `/hotelowner/${hotel.id}` : `/hotel/${hotel.id}`} className="text-decoration-none">
            <div className="card shadow-sm listing-card">
              <img src={hotel.image} className="card-img-top" alt="Listing" />
              <div className="card-body">
                <h5 className="card-title">{hotel.name}</h5>
                <p className="card-text">{hotel.address}</p>
                <p className="card-text price">Price: ${hotel.price_per_night}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold rating">⭐ {hotel.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}