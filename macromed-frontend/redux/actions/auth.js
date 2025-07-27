import axios from "axios";
import config from "constants/config";
import jwt from "jsonwebtoken";
import { toast } from "react-toastify";
import Errors from "components/admin/FormItems/error/errors";
import Router from 'next/router';

export const AUTH_FAILURE = "AUTH_FAILURE";
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const RESET_REQUEST = "RESET_REQUEST";
export const RESET_SUCCESS = "RESET_SUCCESS";
export const PASSWORD_RESET_EMAIL_REQUEST = "PASSWORD_RESET_EMAIL_REQUEST";
export const PASSWORD_RESET_EMAIL_SUCCESS = "PASSWORD_RESET_EMAIL_SUCCESS";
export const AUTH_INIT_SUCCESS = "AUTH_INIT_SUCCESS";
export const AUTH_INIT_ERROR = "AUTH_INIT_ERROR";
export const REGISTER_REQUEST = "REGISTER_REQUEST";
export const REGISTER_SUCCESS = "REGISTER_SUCCESS";

async function findMe() {
  try {
    console.log('🔍 Fetching user data from /api/user...');
    const response = await axios.get(`${config.baseURLApi}/user`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user data:', error.response?.data || error.message);
    throw error;
  }
}

export function authError(payload) {
  return {
    type: AUTH_FAILURE,
    payload,
  };
}

export function doInit() {
  return async (dispatch) => {
    try {
      console.log('🔄 Starting app initialization...');
      let currentUser = null;
      let token = typeof window !== 'undefined' && localStorage.getItem("token");
      console.log('🔍 Checking for existing token:', token ? 'Token found' : 'No token found');
      
      if (token) {
        console.log('👤 Token found, fetching user data...');
        currentUser = await findMe();
        console.log('✅ User data retrieved during init:', currentUser);
      } else {
        console.log('ℹ️ No token found, skipping user data fetch');
      }
      
      dispatch({
        type: AUTH_INIT_SUCCESS,
        payload: {
          currentUser,
        },
      });
      console.log('✅ App initialization completed successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Errors.handle(error);

      dispatch({
        type: AUTH_INIT_ERROR,
        payload: error,
      });
    }
  };
}

export function logoutUser() {
  return (dispatch) => {
    dispatch({
      type: LOGOUT_REQUEST,
    });
    typeof window !== 'undefined' && localStorage.removeItem("token");
    typeof window !== 'undefined' && localStorage.removeItem("user");
    axios.defaults.headers.common["Authorization"] = "";
    dispatch({
      type: LOGOUT_SUCCESS,
    });
  };
}

export function receiveToken(token) {
  return (dispatch) => {
    let user = jwt.decode(token);

    typeof window !== 'undefined' && localStorage.setItem("token", token);
    typeof window !== 'undefined' && localStorage.setItem("user", JSON.stringify(user));
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    dispatch({
      type: LOGIN_SUCCESS,
    });
    if (typeof window !== 'undefined') { window.location.href = "/shop" } 
  };
}

export function loginUser(creds) {
  return (dispatch) => {
    console.log('🚀 Starting login process...', { email: creds.email });
    dispatch({
      type: LOGIN_REQUEST,
    });
    if (creds.social) {
      window.location.href = config.baseURLApi + "/auth/signin/" + creds.social;
    } else if (creds.email.length > 0 && creds.password.length > 0) {
      console.log('📡 Making login API call to:', `${config.baseURLApi}/login`);
      axios
        .post(`${config.baseURLApi}/login`, creds)
        .then((res) => {
          console.log('✅ Login API response received:', res.data);
          const { token, user, message } = res.data;
          
          // Print the token when user logs in
          console.log('🔐 User login token:', token);
          
          // Save token and user data to localStorage
          typeof window !== 'undefined' && localStorage.setItem("token", token);
          typeof window !== 'undefined' && localStorage.setItem("user", JSON.stringify(user));
          console.log('💾 Token and user data saved to localStorage');
          
          // Set authorization header for future requests
          axios.defaults.headers.common["Authorization"] = "Bearer " + token;
          console.log('🔑 Authorization header set for future requests');
          
          dispatch({
            type: LOGIN_SUCCESS,
            payload: { user, message }
          });
          
          // Show success message
          toast.success(message || "Login successful");
          
          // Redirect to shop page
          if (typeof window !== 'undefined') { 
            console.log('🔄 Redirecting to shop page...');
            window.location.href = "/shop" 
          }
        })
        .catch((err) => {
          console.error('❌ Login API error:', err.response?.data || err.message);
          console.log('Full error object:', err);
          const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
          dispatch(authError(errorMessage));
          toast.error(errorMessage);
        });
    } else {
      console.error('❌ Invalid credentials provided');
      dispatch(authError("Something was wrong. Try again"));
    }
  };
}

export function verifyEmail(token) {
  return (dispatch) => {
    console.log(token, 'TIOKEN')
    axios
      .put(`${config.baseURLApi}/verify-email`, { token })
      .then((verified) => {
        if (verified) {
          toast.success("Your email was verified");
        }
      })
      .catch((err) => {
        toast.error(err.response.data);
      })
      .finally(() => {
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      });
  };
}

export function resetPassword(token, password) {
  return (dispatch) => {
    dispatch({
      type: RESET_REQUEST,
    });
    axios
      .put(`${config.baseURLApi}/password-reset`, { token, password })
      .then((res) => {
        dispatch({
          type: RESET_SUCCESS,
        });
        toast.success("Password has been updated");
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      })
      .catch((err) => {
        dispatch(authError(err.response.data));
      });
  };
}

export function sendPasswordResetEmail(email) {
  return (dispatch) => {
    dispatch({
      type: PASSWORD_RESET_EMAIL_REQUEST,
    });
    axios
      .post(`${config.baseURLApi}/send-password-reset-email`, { email })
      .then((res) => {
        dispatch({
          type: PASSWORD_RESET_EMAIL_SUCCESS,
        });
        toast.success("Email with resetting instructions has been sent");
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      })
      .catch((err) => {
        dispatch(authError(err.response.data));
      });
  };
}

export function registerUser(creds) {
  return (dispatch) => {
    dispatch({
      type: REGISTER_REQUEST,
    });
    console.log('sdf')
    if (creds.email.length > 0 && creds.password.length > 0) {
      axios
        .post(`${config.baseURLApi}/signup`, creds)
        .then((res) => {
          dispatch({
            type: REGISTER_SUCCESS,
          });
          toast.success(
            "You've been registered successfully. Please check your email for verification link"
          );
           if (typeof window !== 'undefined') { window.location.href = "/login" }
        })
        .catch((err) => {
          dispatch(authError(err.response.data));
        });
    } else {
      dispatch(authError("Something was wrong. Try again"));
    }
  };
}
