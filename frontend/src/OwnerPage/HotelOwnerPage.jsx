import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getHotelDetail, createAmenity, replyToComment } from "../api"; // Import API functions
import HotelUploadUpdate from "../assets/Components/HotelUploadUpdate";
export default function HotelOwnerPage() {
    const { id } = useParams(); // Get hotel ID from URL
    const navigate = useNavigate(); // Navigation function
    const [hotel, setHotel] = useState(null);
    const [newAmenity, setNewAmenity] = useState({ name: "", description: "" });
    const [commentReply, setCommentReply] = useState("");
    const [amenities, setAmenities] = useState([]); // List of amenities


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


    //   // Handle replying to comments
    //   const handleReply = async (commentId) => {
    //     if (!commentReply) return alert("Please enter a reply.");

    //     try {
    //       await replyToComment(commentId, commentReply);
    //       alert("Reply submitted successfully!");
    //       setCommentReply("");
    //     } catch (err) {
    //       console.error("Error replying to comment:", err);
    //       alert("Failed to submit reply.");
    //     }
    //   };

    // Show loading text if hotel details are not yet loaded
    if (!hotel) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mt-4">
            {/* Header Section with "Return to Home" Button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Detailed Room Information</h2>
                <button className="btn btn-outline-danger" onClick={() => navigate("/owenermainpage")}>
                    Return to Home
                </button>
            </div>
            <div className="row">
                <div className="col-md-8">
                    <img src={hotel.image} className="imageDetail" alt={hotel.name} />
                    <div className="d-flex gap-2">
                        {hotel.additional_images?.map((img, index) => (
                            <img key={index} src={img} className="img-thumbnail" alt="Hotel Extra" width="150px" />
                        ))}
                    </div>
                </div>
                <div className="col-md-4">
                    <p>
                        <strong>Address:</strong> {hotel.address}, {hotel.city}, {hotel.country}
                    </p>
                    <p>
                        <strong>{hotel.guests}</strong> Guests • <strong>{hotel.total_beds}</strong> Beds •{" "}
                        <strong>{hotel.total_rooms}</strong> rooms
                    </p>
                    <p>
                        <strong>Amenities:</strong>{" "}
                        {hotel.amentities?.map((amenity, index) => (
                            <span key={index} className="badge bg-secondary me-1">{amenity.name}</span>
                        ))}
                    </p>


                    {/* Star Rating Section */}
                    <div className="d-flex align-items-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= hotel.rating ? "#FFD700" : "#CCCCCC", fontSize: "24px" }}>
                                ★
                            </span>
                        ))}
                    </div>
                    <HotelUploadUpdate isEditMode={true} />
                </div>
                
            </div>
                       


            {/* Comments Section */}
            <h3>Comments</h3>
            <div className="mb-3">
                {hotel.comments?.map((comment) => (
                    <div key={comment.id} className="border p-2 mb-2 rounded">
                        <p><strong>{comment.user_name}:</strong> {comment.text}</p>
                        {/* Reply Input Field */}
                        <textarea
                            className="form-control mb-2"
                            rows="2"
                            placeholder="Reply user"
                            value={commentReply}
                        //   onChange={(e) => setCommentReply(e.target.value)}
                        />
                        {/* <button className="btn btn-secondary" onClick={() => handleReply(comment.id)}>
              Submit
            </button> */}
                    </div>
                ))}
            </div>
        </div>
    );
}