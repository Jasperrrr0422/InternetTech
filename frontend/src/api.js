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

export async function postHotelInfomation({name,description,
  address,price_per_night,total_rooms,total_beds,amentities,image}) {
    const price = Number(price_per_night);
    const rooms = Number(total_rooms);
    const beds = Number(total_beds);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("price_per_night", price); 
    formData.append("total_rooms", rooms);
    formData.append("total_beds", beds);
    formData.append("amenities", amentities);
  
    if (image) {
      formData.append("image", image);
    }
  
    return request("/api/properties/hotel/list/", {
      method: "POST",
      body: formData,
    });
  }