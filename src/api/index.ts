// Base API URL
const API_BASE_URL = "http://localhost:8801";

// Helper function to get the auth token from localStorage
export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

// Generic fetch function with authentication
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies in the request
  });

  if (!response.ok) {
    // Handle different error status codes
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      // Clear the token and redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response.json();
}

// API functions for different endpoints
export const api = {
  // Auth related endpoints
  auth: {
    login: async (email: string, password: string) => {
      console.log("Sending login request for:", email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login API response:", data);
      return data;
    },

    verifyOtp: async (email: string, otp: string) => {
      console.log("Sending OTP verification for:", email);
      const response = await fetch(`${API_BASE_URL}/auth/login-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include", // Include cookies in the request
      });

      const data = await response.json();
      console.log("Verify OTP API response:", data);
      return data;
    },
  },

  // Products related endpoints
  products: {
    getAll: ({
      page,
      size,
      sort,
    }: {
      page: number;
      size: number;
      sort: string;
    }) => fetchWithAuth(`/products?page=${page}&size=${size}&sort=${sort}`),
    getById: (id: string) => fetchWithAuth(`/products/${id}`),
    create: (productData: any) =>
      fetchWithAuth("/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),
    update: (id: string, productData: any) =>
      fetchWithAuth(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/products/${id}`, {
        method: "DELETE",
      }),
    getFeatured: ({
      page,
      size,
      sort,
    }: {
      page: number;
      size: number;
      sort: string;
    }) =>
      fetchWithAuth(
        `/products/featured?page=${page}&size=${size}&sort=${sort}`
      ),
  },

  // Ratings related endpoints
  ratings: {
    getByProductId: (productId: string) =>
      fetchWithAuth(`/ratings/product/${productId}`),
    create: (ratingData: any) =>
      fetchWithAuth("/ratings", {
        method: "POST",
        body: JSON.stringify(ratingData),
      }),
  },
};
