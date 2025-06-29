import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Users
export const fetchCustomer = createAsyncThunk(
  'appUsers/fetchCustomer', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/customers', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users')
    }
  }
)

// ** Add User
export const addUser = createAsyncThunk(
  'appUsers/addUser', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/apps/users/add-user', data)
      dispatch(fetchCustomer(getState().user.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add user')
    }
  }
)

// ** Delete User
export const deleteUser = createAsyncThunk(
  'appUsers/deleteUser', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete('/apps/users/delete', {
        data: id
      })
      dispatch(fetchCustomer(getState().user.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete user')
    }
  }
)

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: [],
    loading: false,
    error: null
  },
  reducers: {
    clearErrors: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Users reducers
      .addCase(fetchCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data.list
        state.error = null
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add User reducers
      .addCase(addUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addUser.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add user'
      })
      
      // Delete User reducers
      .addCase(deleteUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete user'
      })
  }
})

export const { clearErrors } = appUsersSlice.actions

export default appUsersSlice.reducer
