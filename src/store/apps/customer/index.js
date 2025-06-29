import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Customers
export const fetchCustomer = createAsyncThunk(
  'appCustomers/fetchCustomer', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/apps/customers/list', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch customers')
    }
  }
)

// ** Add Customer
export const addCustomer = createAsyncThunk(
  'appCustomers/addCustomer', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/apps/customers/add-customer', data)
      dispatch(fetchCustomer(getState().customer.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add customer')
    }
  }
)

// ** Delete Customer
export const deleteCustomer = createAsyncThunk(
  'appCustomers/deleteCustomer', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete('/apps/customers/delete', {
        data: id
      })
      dispatch(fetchCustomer(getState().customer.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete customer')
    }
  }
)

export const appCustomersSlice = createSlice({
  name: 'appCustomers',
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
      // Fetch Customer reducers
      .addCase(fetchCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.customers
        state.total = action.payload.total
        state.params = action.payload.params
        state.allData = action.payload.allData
        state.error = null
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add Customer reducers
      .addCase(addCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addCustomer.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add customer'
      })
      
      // Delete Customer reducers
      .addCase(deleteCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete customer'
      })
  }
})

export const { clearErrors } = appCustomersSlice.actions

export default appCustomersSlice.reducer