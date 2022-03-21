import api from '../utils/api';
import { setAlert } from "./alert";

import {
  GET_PROFILE,
  PROFILE_ERROR
} from "./types"

/*
  NOTE: we don't need a config object for axios as the
 default headers in axios are already Content-Type: application/json
 also axios stringifies and parses JSON for you, so no need for 
 JSON.stringify or JSON.parse
*/

// Get current users profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await api.get('/profile/me');

    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create or update profile
export const createProfile =
  (formData, navigate, edit = false) =>
    async (dispatch) => {
      try {
        const res = await api.post('/profile', formData);

        dispatch({
          type: GET_PROFILE,
          payload: res.data
        });

        dispatch(
          setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success')
        );

        if (!edit) {
          navigate('/dashboard');
        }
      } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
          errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
          type: PROFILE_ERROR,
          payload: { msg: err.response.statusText, status: err.response.status }
        });
      }
    };