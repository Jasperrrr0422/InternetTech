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
    const url = "api/auth/register/"; // 确保URL结尾带 `/`
    
    const body = JSON.stringify({ username, email, password, first_name, last_name, role });
  
    console.log("Register API Request:", body); // 先打印请求的数据
  
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