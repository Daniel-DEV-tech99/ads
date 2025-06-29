import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Filters
export const fetchFilters = createAsyncThunk(
  'appFilters/fetchFilters', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/filters', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch filters')
    }
  }
)

// ** Fetch Single Filter by ID
export const fetchFilterById = createAsyncThunk(
  'appFilters/fetchFilterById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) return null
      
      const response = await axiosInstance.get(`/filters/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch filter details')
    }
  }
)

// ** Add Filter
export const addFilter = createAsyncThunk(
  'appFilters/addFilter', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      // Set the correct headers for FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      const response = await axiosInstance.post('/filters', data, config)
      dispatch(fetchFilters(getState().filters.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add filter')
    }
  }
)

// ** Delete Filter
export const deleteFilter = createAsyncThunk(
  'appFilters/deleteFilter', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/filters/${id}`)
      dispatch(fetchFilters(getState().filters.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete filter')
    }
  }
)

// ** Update Filter
export const updateFilter = createAsyncThunk(
  'appFilters/updateFilter',
  async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/filters/${id}`, data)
      dispatch(fetchFilters(getState().filters.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update filter')
    }
  }
)

export const appFiltersSlice = createSlice({
  name: 'appFilters',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: [],
    loading: false,
    error: null,
    selectedFilter: null
  },
  reducers: {
    clearErrors: state => {
      state.error = null
    },
    setParams: (state, action) => {
      state.params = action.payload
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Filters reducers
      .addCase(fetchFilters.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data || []
        state.total = action.payload.data.total || 0
        state.error = null
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add Filter reducers
      .addCase(addFilter.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addFilter.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addFilter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add filter'
      })
      
      // Delete Filter reducers
      .addCase(deleteFilter.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFilter.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteFilter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete filter'
      })
      
      // Update Filter reducers
      .addCase(updateFilter.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFilter.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(updateFilter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update filter'
      })
      
      // Fetch Filter by ID reducers
      .addCase(fetchFilterById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilterById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedFilter = action.payload.data
        state.error = null
      })
      .addCase(fetchFilterById.rejected, (state, action) => {
        state.loading = false
        state.selectedFilter = null
        state.error = action.payload || 'Failed to fetch filter details'
      })
  }
})

export const { clearErrors, setParams } = appFiltersSlice.actions

export default appFiltersSlice.reducer