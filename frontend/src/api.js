// Base URL for API requests
const BASE_URL = "http://127.0.0.1:8000/";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");

  // Default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token is available
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Merge default headers with custom headers from options
  const headers = { ...defaultHeaders, ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    // Handle non-successful responses
    if (!response.ok) {
      // If the token is invalid or expired, redirect to login page
      if (response.status === 401) {
        console.warn("Unauthorized (401). Redirecting to login...");
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return;
      }
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw new Error(error.message);
  }
}

//  Login API function

export async function login(username, password) {
  return request("api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}


// Register API function

export async function register(username, email, password, first_name, last_name, role) {
  return request("api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password, first_name, last_name, role }),
  });
}

// Fetch hotel list with pagination
export async function getHotelList(page = 1, pageSize = 12,filters={}) {
    const queryParams = new URLSearchParams({
        page,
        page_size: pageSize,
        ...filters, 
      });
  return request(`api/properties/hotels/list/?${queryParams.toString()}`, {
    method: "GET",
  });
}
export async function getHotelDetail(id) {
    return request(`api/properties/hotels/detail/${id}/`, {
      method: "GET",
    });
  }
// Get amenities 
export async function getAmenities() {
    return request("/api/properties/amentities/", {
      method: "GET",
    });
  }
// Create new Amenity 
export async function createAmenity(name, description) {
    return request("/api/properties/amentities/", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }
export async function postHotelInformation(formData) {
    const token = localStorage.getItem("access_token");
  
    const headers = {
      "Authorization": `Bearer ${token}`,
    };
  
    try {
      const response = await fetch(`${BASE_URL}/api/properties/hotels/list/`, {
        method: "POST",
        body: formData,
        headers,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }
  
      return response.json();
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }
  export async function updateHotelInformation(hotelId,formData) {
    const token = localStorage.getItem("access_token");
  
    const headers = {
      "Authorization": `Bearer ${token}`,
    };
  
    try {
      const response = await fetch(`${BASE_URL}api/properties/hotels/detail/${hotelId}/`, {
        method: "PUT",
        body: formData,
        headers,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }
  
      return response.json();
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

export async function createPaypalPayment(orderId) {
  return request("/api/payments/paypal/create/",{
    method:"POST",
    body: JSON.stringify({
      order_id: orderId,  
    }),
  }); 
  }
  export async function createBooking(bookingData) {
    try {
      const response = await request("/api/bookings/orders/create/", {
        method: "POST",
        body: JSON.stringify({
          hotel: parseInt(bookingData.hotel, 10),
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          guests: parseInt(bookingData.guests, 10),
        }),
      });
  
      return response;
    } catch (error) {
      console.error("Booking failed:", error);
      throw error;
    }
  }
// Fetch Order History 
export async function fetchOrders() {
  try {
    return request("/api/bookings/orders",{
      method:"GET",

    });  
  } catch (error) {
    console.error(error);
  }
}
// Cancel order
export async function cancelOrder(orderId) {
  const numericOrderId = Number(orderId);
  return request(`api/bookings/orders/cancel/${numericOrderId}/`, {
    method: "POST",
  });
}
// Complete order
export async function completeOrder(orderId) {
  const numericOrderId = Number(orderId);
  return request(`api/bookings/orders/completed/${numericOrderId}/`, {
    method: "POST",
  });
}
export async function rateOrder(orderId, rating) {
  return request(`/api/bookings/orders/rating/${orderId}/`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

// Execute the payment after user approval
export async function executePayment(orderId, paymentId, payerId) {
  const numericOrderId = Number(orderId); 
  try {
    const response = await request(`api/payments/paypal/execute/?PayerID=${payerId}&order_id=${numericOrderId}&paymentId=${paymentId}`, {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("Error executing PayPal payment:", error);
    throw error;
  }
}

// 创建评论
export const createReview = async (data) => {
  const response = await fetch('/api/reviews/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create review');
  return response.json();
};

// 获取酒店评论
export const getHotelReviews = async (hotelId) => {
  const response = await fetch(`/api/reviews/hotel/${hotelId}/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
};