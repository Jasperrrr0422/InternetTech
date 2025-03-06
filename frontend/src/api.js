// Base url
const BASE_URL = "http://127.0.0.1:8000/"

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }
  
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
// Login api
export async function login(username, password) {
    return request("api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
  }
  export async function register(username, email, password, first_name, last_name, role) {
    const url = "api/auth/register/"; 
    
    const body = JSON.stringify({ username, email, password, first_name, last_name, role });
  
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error("Register API Error Response:", data);
        throw new Error(data.error || "Registration failed");
      }
  
      return data;
    } catch (error) {
      console.error("Register API Error:", error.message);
      throw error;
    }
  }
  export async function getHotelList({ page = 1, pageSize = 12 }) {
    let token = localStorage.getItem("access_token");
    console.log(token)

  
    const url = `http://127.0.0.1:8000/api/properties/hotels/list/?page=${page}&page_size=${pageSize}`;
  
    try {
      let response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // 🔥 确保这里有 token
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        console.warn("403 Forbidden. Token may be invalid.");
       
     
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to fetch hotel list");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching hotel list:", error);
      throw error;
    }
  }