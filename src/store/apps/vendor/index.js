import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Vendors
export const fetchVendor = createAsyncThunk(
  'appVendors/fetchVendor', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/vendors', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch vendors')
    }
  }
)

// ** Add Vendor
export const addVendor = createAsyncThunk(
  'appVendors/addVendor', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/apps/vendors/add-vendor', data)
      dispatch(fetchVendor(getState().vendor.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add vendor')
    }
  }
)

// ** Delete Vendor
export const deleteVendor = createAsyncThunk(
  'appVendors/deleteVendor', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete('/apps/vendors/delete', {
        data: id
      })
      dispatch(fetchVendor(getState().vendor.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete vendor')
    }
  }
)

export const appVendorsSlice = createSlice({
  name: 'appVendors',
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
      // Fetch Vendor reducers
      .addCase(fetchVendor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVendor.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data.list
     
        state.error = null
      })
      .addCase(fetchVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add Vendor reducers
      .addCase(addVendor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addVendor.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add vendor'
      })
      
      // Delete Vendor reducers
      .addCase(deleteVendor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVendor.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete vendor'
      })
  }
})

export const { clearErrors } = appVendorsSlice.actions

export default appVendorsSlice.reducer