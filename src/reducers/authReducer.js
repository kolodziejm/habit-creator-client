import { SET_USER, LOGOUT_USER, CLEAR_EXPIRED_INFO } from '../actions/types';

const initialState = {
  isAuthenticated: false,
  user: {},
  expiredInfo: ''
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      }

    case LOGOUT_USER:
      return {
        ...state,
        user: {},
        isAuthenticated: false,
        expiredInfo: action.withMessage ? 'Token has expired, log in again' : ''
      }

    case CLEAR_EXPIRED_INFO:
      return {
        ...state,
        expiredInfo: ''
      }

    default:
      return state;
  }
}