import API from "../utils/axiosClient";



// Signup API
export const signup = async (data) => {
    return await API.post("/auth/signup/", data);
};

// Verify OTP API
export const verifyOtp = async (data) => {
    return await API.post("/auth/verify-otp/", data);
};

// Resend OTP
export const resendSignupOtp = async (data) => {
    return await API.post("/auth/resend-otp/", data);
};


// Login
export const login = async (data) => {
  return await API.post("/auth/login/", data);
};

export const getCurrentUser = async () => {
  return await API.get("/auth/me/");
};


// L0gout 
export const logout = async () => {
  return await API.post("/auth/logout/");
};


export const requestPasswordReset = (data) =>
  API.post("/auth/forgot-password/", data);

export const verifyForgotOtp = (data) =>
  API.post("/auth/forgot-password/verify-otp/", data);

export const resetPassword = (data) =>
  API.post("/auth/forgot-password/reset/", data);


export const googleLogin = async (idToken) => {
  const res = await API.post("/auth/google-login/", {
    id_token: idToken,
  });
  return res.data;
};


export const resendForgotOtp = async (data) => {
    return await API.post("/auth/forgot-password/resend-otp/", data);
};

 