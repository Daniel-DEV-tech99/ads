import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Transactions
export const fetchData = createAsyncThunk(
  'appTransactions/fetchData', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/transactions', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch transactions')
    }
  }
)

// ** Add Transaction
export const addTransaction = createAsyncThunk(
  'appTransactions/addTransaction', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data:', data);
      
      // Determine the API endpoint based on transaction type
      let endpoint = '/transactions'
   
      
      const response = await axiosInstance.post(endpoint, data)
      console.log('API response:', response.data);
      dispatch(fetchData(getState().transaction.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add transaction')
    }
  }
)

// ** Delete Transaction
export const deleteTransaction = createAsyncThunk(
  'appTransactions/deleteTransaction', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/transactions/${id}`)
      dispatch(fetchData(getState().transaction.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete transaction')
    }
  }
)

export const appTransactionsSlice = createSlice({
  name: 'appTransactions',
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
      // Fetch Transactions reducers
      .addCase(fetchData.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data || []
        state.total = action.payload.data?.total || 0
        state.error = null
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add Transaction reducers
      .addCase(addTransaction.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addTransaction.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add transaction'
      })
      
      // Delete Transaction reducers
      .addCase(deleteTransaction.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTransaction.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete transaction'
      })
  }
})

export const { clearErrors } = appTransactionsSlice.actions

export default appTransactionsSlice.reducer