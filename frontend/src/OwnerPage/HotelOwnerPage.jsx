import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getHotelDetail, createAmenity, replyToComment, getHotelReviews, createReview } from "../api"; // Import API functions
import HotelUploadUpdate from "../assets/Components/HotelUploadUpdate";

export default function HotelOwnerPage() {
    const { id } = useParams(); // Get hotel ID from URL
    const navigate = useNavigate(); // Navigation function
    const [hotel, setHotel] = useState(null);
    const [newAmentity, setNewAmentity] = useState({ name: "", description: "" });
    const [commentReply, setCommentReply] = useState("");
    const [amentities, setAmentities] = useState([]); // List of amenities
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

    // 修改评论组件
    const ReviewItem = ({ review, depth = 0 }) => {
        const hasChildren = review.children && review.children.length > 0;
        const isCollapsed = collapsedComments.has(review.id);
        const isOwner = review.user.role === 'owner';
        
        return (
            <div className={`card shadow-sm mb-3 border-0 ${depth > 0 ? 'bg-light' : ''} ${isOwner ? 'border-warning border-2' : ''}`}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                            <div 
                                className={`${isOwner ? 'bg-warning' : depth === 0 ? 'bg-primary' : 'bg-secondary'} text-white rounded-circle p-2 me-2`}
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
                                    {isOwner && (
                                        <span className="badge bg-warning text-dark ms-2">
                                            <i className="bi bi-house-door-fill me-1"></i>
                                            Owner
                                        </span>
                                    )}
                                </h6>
                                <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {review.created_at}
                                </small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
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
                                className={`btn btn-${isOwner ? 'outline-warning' : depth === 0 ? 'outline-primary' : 'outline-secondary'} btn-sm`}
                                onClick={() => setReplyTo(review.id)}
                            >
                                <i className="bi bi-reply me-1"></i>
                                Reply as Owner
                            </button>
                        </div>
                    </div>
                    <p className={`mb-3 ${depth > 0 ? 'ms-5' : ''}`}>
                        {isOwner && (
                            <span className="badge bg-warning text-dark me-2">
                                <i className="bi bi-patch-check-fill me-1"></i>
                                Official Response
                            </span>
                        )}
                        {review.comment}
                    </p>
                    
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

                    {hasChildren && isCollapsed && (
                        <div 
                            className="ms-4 ps-3 text-muted"
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

    // Show loading text if hotel details are not yet loaded
    if (!hotel) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container-fluid py-4 bg-light">
            {/* 顶部导航栏 */}
            <div className="container mb-4">
                <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
                    <div>
                        <h2 className="mb-0">{hotel.name}</h2>
                        <p className="text-muted mb-0">
                            <i className="bi bi-geo-alt"></i> {hotel.address}
                        </p>
                    </div>
                    <button 
                        className="btn btn-outline-primary" 
                        onClick={() => navigate("/owenermainpage")}
                    >
                        <i className="bi bi-arrow-left"></i> Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="container">
                <div className="row g-4">
                    {/* 左侧主要内容区 */}
                    <div className="col-lg-8">
                        {/* 图片展示区 */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Property Images</h5>
                                <img 
                                    src={hotel.image} 
                                    className="w-100 rounded mb-3" 
                                    style={{height: "400px", objectFit: "cover"}}
                                    alt={hotel.name} 
                                />
                                <div className="d-flex gap-2 overflow-auto pb-2">
                                    {hotel.additional_images?.map((img, index) => (
                                        <img 
                                            key={index} 
                                            src={img} 
                                            className="rounded" 
                                            style={{width: "150px", height: "100px", objectFit: "cover"}}
                                            alt={`${hotel.name} - ${index + 1}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 评论区域 */}
                        <div className="container mt-5">
                            <div className="card shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h3 className="card-title">
                                                <i className="bi bi-chat-dots me-2"></i>
                                                Guest Reviews and Responses
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

                                    {/* 回复框 */}
                                    <div className="mb-4">
                                        <form onSubmit={handleReviewSubmit}>
                                            {replyTo && (
                                                <div className="alert alert-info d-flex align-items-center">
                                                    <i className="bi bi-reply-fill me-2"></i>
                                                    <div>
                                                        <span>Replying to </span>
                                                        <strong>
                                                            {(() => {
                                                                const targetReview = reviews?.find(r => 
                                                                    r.id === replyTo || 
                                                                    r.children?.some(c => c.id === replyTo)
                                                                );
                                                                return targetReview?.user.username || 'comment';
                                                            })()}
                                                            {(() => {
                                                                const targetReview = reviews?.find(r => 
                                                                    r.id === replyTo || 
                                                                    r.children?.some(c => c.id === replyTo)
                                                                );
                                                                return targetReview?.user.role === 'owner' ? (
                                                                    <span className="badge bg-warning text-dark ms-1">Owner</span>
                                                                ) : null;
                                                            })()}
                                                        </strong>
                                                        <span> #{replyTo}</span>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        className="btn-close ms-auto"
                                                        onClick={() => setReplyTo(null)}
                                                    ></button>
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <textarea 
                                                    className="form-control border-0 bg-light"
                                                    style={{ minHeight: "120px", resize: "none" }}
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder={replyTo ? "Write your official response..." : "Write your response as owner..."}
                                                ></textarea>
                                            </div>
                                            {reviewError && (
                                                <div className="alert alert-danger d-flex align-items-center">
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                    {reviewError}
                                                </div>
                                            )}
                                            <button type="submit" className="btn btn-warning">
                                                <i className="bi bi-send-fill me-2"></i>
                                                {replyTo ? "Post Official Response" : "Post Response"}
                                            </button>
                                        </form>
                                    </div>

                                    {/* 评论列表 */}
                                    <div className="reviews-list">
                                        {reviews ? (
                                            reviews.length > 0 ? (
                                                reviews.map(review => (
                                                    <ReviewItem 
                                                        key={review.id} 
                                                        review={review} 
                                                        depth={0}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-chat-dots display-4 text-muted mb-3 d-block"></i>
                                                    <p className="text-muted">No reviews yet for this property.</p>
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
                        </div>
                    </div>

                    {/* 右侧信息栏 */}
                    <div className="col-lg-4">
                        {/* 基本信息卡片 */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Property Details</h5>
                                
                                {/* 评分显示 */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="text-muted me-2">Rating:</span>
                                        <div className="text-warning">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i key={star} 
                                                    className={`bi bi-star${star <= hotel.rating ? '-fill' : ''} me-1`}>
                                                </i>
                                            ))}
                                            <span className="ms-2 text-dark">
                                                {hotel.rating ? hotel.rating.toFixed(1) : 'N/A'} / 5
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 房间信息 - 使用图标和更紧凑的布局 */}
                                <div className="row g-2 mb-4">
                                    <div className="col-4">
                                        <div className="border rounded p-2 text-center">
                                            <i className="bi bi-people"></i>
                                            <div className="small">Guests</div>
                                            <strong>{hotel.guests || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border rounded p-2 text-center">
                                            <i className="bi bi-door-open"></i>
                                            <div className="small">Rooms</div>
                                            <strong>{hotel.total_rooms || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="border rounded p-2 text-center">
                                            <i className="bi bi-hospital"></i>
                                            <div className="small">Beds</div>
                                            <strong>{hotel.total_beds || 0}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* 设施列表 - 使用网格布局 */}
                                <div className="mb-4">
                                    <h6 className="mb-2">Amenities</h6>
                                    <div className="row g-2">
                                        {hotel.amentities_detail?.map((amenity, index) => (
                                            <div key={index} className="col-6">
                                                <div className="border rounded p-2 text-center small">
                                                    {amenity.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 编辑表单 - 使用折叠面板 */}
                        <div className="card shadow-sm">
                            <div className="card-header bg-white" style={{ cursor: 'pointer' }}>
                                <button 
                                    className="btn btn-link w-100 text-start text-decoration-none p-0" 
                                    type="button" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target="#editForm"
                                >
                                    <h5 className="mb-0">Edit Property</h5>
                                </button>
                            </div>
                            <div id="editForm" className="collapse">
                                <div className="card-body">
                                    <HotelUploadUpdate isEditMode={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}