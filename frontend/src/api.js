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
  export async function createBooking(bookingData) {
    const token = localStorage.getItem("access_token");
    const url = `/api/bookings/orders/create/`;
    return request(`/api/bookings/orders/create/`,{
      method:"POST",
      body: JSON.stringify({
        hotel: parseInt(bookingData.hotel, 10), 
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        guests: parseInt(bookingData.guests, 10),
      }),
    })
  }
  export async function getAmenities() {
    return request("/api/properties/amentities/", {
      method: "GET",
    });
  }
  export async function postHotelInformation(formData) {
    const token = localStorage.getItem("access_token");
  
    const headers = {
      "Authorization": `Bearer ${token}`,
      // 删除 'Content-Type'，让浏览器自动设置为 multipart/form-data
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