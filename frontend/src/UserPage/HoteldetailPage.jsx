import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getHotelDetail, createBooking, createReview, getHotelReviews } from "../api";

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
  const [reviews, setReviews] = useState(null);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [collapsedComments, setCollapsedComments] = useState(new Set());

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

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)), 0);
  };

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

  // 获取评论数据
  const fetchReviews = useCallback(async () => {
    try {
      const data = await getHotelReviews(id);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [id]);

  // 在组件加载时获取评论
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 处理评论提交
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);

    if (!comment.trim()) {
      setReviewError("Please enter a comment");
      return;
    }

    try {
      const reviewData = {
        hotel: parseInt(id, 10),
        comment: comment.trim(),
        parent: replyTo
      };

      await createReview(reviewData);
      setComment("");
      setReplyTo(null);
      fetchReviews(); // 刷新评论列表
    } catch (error) {
      setReviewError("Failed to post comment. Please try again.");
      console.error("Error posting review:", error);
    }
  };

  // 处理折叠/展开
  const toggleCollapse = (commentId) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Show loading text if hotel details are not yet loaded
  if (!hotel) {
    return <p>Loading...</p>;
  }

  // 修改后的 ReviewItem 组件
  const ReviewItem = ({ review, depth = 0 }) => {
    const hasChildren = review.children && review.children.length > 0;
    const isCollapsed = collapsedComments.has(review.id);
    
    return (
      <div className={`card shadow-sm mb-3 border-0 ${depth > 0 ? 'bg-light' : ''}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center">
              <div 
                className={`${depth === 0 ? 'bg-primary' : 'bg-secondary'} text-white rounded-circle p-2 me-2`}
                style={{ 
                  width: `${40 - depth * 4}px`, 
                  height: `${40 - depth * 4}px`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: `${1 - depth * 0.1}rem`
                }}
              >
                {review.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0" style={{ fontSize: `${1 - depth * 0.05}rem` }}>
                  {review.user.username}
                </h6>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {review.created_at}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {/* 折叠按钮 - 只在有子评论时显示 */}
              {hasChildren && (
                <button 
                  className="btn btn-link btn-sm text-decoration-none p-0 px-2"
                  onClick={() => toggleCollapse(review.id)}
                >
                  <i className={`bi bi-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                  {isCollapsed ? 
                    `Show ${review.children.length} replies` : 
                    `Hide replies`
                  }
                </button>
              )}
              <button 
                className={`btn btn-${depth === 0 ? 'outline-primary' : 'outline-secondary'} btn-sm`}
                onClick={() => setReplyTo(review.id)}
              >
                <i className="bi bi-reply me-1"></i>
                Reply
              </button>
            </div>
          </div>
          <p className={`mb-3 ${depth > 0 ? 'ms-5' : ''}`}>{review.comment}</p>
          
          {/* 子评论部分 - 添加折叠功能 */}
          {hasChildren && !isCollapsed && (
            <div className={`ms-4 ps-3 border-start ${depth > 0 ? 'border-secondary' : ''}`}>
              {review.children.map(child => (
                <ReviewItem 
                  key={child.id} 
                  review={child} 
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

          {/* 折叠状态提示 */}
          {hasChildren && isCollapsed && (
            <div 
              className="ms-4 ps-3 text-muted cursor-pointer"
              onClick={() => toggleCollapse(review.id)}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-three-dots me-2"></i>
              {review.children.length} hidden {review.children.length === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            {hotel.address}
          </p>
          <p>
          {hotel.city}
          </p>
          <p>
          {hotel.country}
          </p>
          <p>
            <strong>Amenities:</strong>{" "}
            {hotel.amentities_detail?.map((amenity, index) => (
              <span key={index} className="badge bg-secondary me-1">{amenity.name}</span>
            ))}
          </p>
          <p>
            {hotel.guests} Guests • {hotel.total_rooms} Rooms • {hotel.total_beds} Beds
          </p>
          <p className="fw-bold">⭐ {hotel.rating} / 5</p>
          <p>Host by <strong>{hotel.owner_name}</strong></p>

          <div className="border p-3 rounded bg-light">
            {hotel.price_per_night && (
              <div>
                <span>£{hotel.price_per_night} per night</span>
                {checkIn && checkOut && (
                  <div>
                    {calculateNights(checkIn, checkOut)} nights total: 
                    £{hotel.price_per_night * calculateNights(checkIn, checkOut)}
                  </div>
                )}
              </div>
            )}
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
              {hotel.price_per_night && (
                <div>
                  {calculateNights(checkIn, checkOut)} nights total: 
                  £{hotel.price_per_night * calculateNights(checkIn, checkOut)}
                </div>
              )}
            </p>
            <h5 className="text-end">Total: ${totalPrice}</h5>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>
              <i className="bi bi-chat-dots me-2"></i>
              Reviews
            </h3>
            {reviews?.length > 0 && (
              <div className="btn-group btn-group-sm mt-2">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setCollapsedComments(new Set())}
                >
                  <i className="bi bi-chevron-expand me-1"></i>
                  Expand All
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setCollapsedComments(new Set(
                    reviews.flatMap(review => {
                      const ids = [review.id];
                      if (review.children) {
                        ids.push(...review.children.map(child => child.id));
                      }
                      return ids;
                    })
                  ))}
                >
                  <i className="bi bi-chevron-contract me-1"></i>
                  Collapse All
                </button>
              </div>
            )}
          </div>
          <span className="badge bg-primary rounded-pill px-3 py-2">
            <i className="bi bi-star-fill me-1"></i>
            {reviews?.length || 0} Reviews
          </span>
        </div>
        
        {/* 评论输入框 */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleReviewSubmit}>
              {replyTo && (
                <div className="alert alert-info d-flex align-items-center">
                  <i className="bi bi-reply-fill me-2"></i>
                  <span>Replying to comment #{replyTo}</span>
                  <button 
                    type="button" 
                    className="btn-close ms-auto"
                    onClick={() => setReplyTo(null)}
                  ></button>
                </div>
              )}
              <div className="mb-3 position-relative">
                <textarea 
                  className="form-control border-0 bg-light"
                  style={{ minHeight: "120px", resize: "none" }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={replyTo ? "Write your response..." : "Share your experience..."}
                ></textarea>
              </div>
              {reviewError && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {reviewError}
                </div>
              )}
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send-fill me-2"></i>
                  {replyTo ? "Post Response" : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="reviews-list">
          {reviews ? (
            reviews.length > 0 ? (
              reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-chat-dots display-4 text-muted mb-3"></i>
                <p className="text-muted">No reviews yet. Be the first to review!</p>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}