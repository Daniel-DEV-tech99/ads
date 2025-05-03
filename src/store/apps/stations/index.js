import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Stations
export const fetchStations = createAsyncThunk(
  'appStations/fetchStations', 
  async (params, { rejectWithValue }) => {
    try {
      console.log('Fetching stations with params:', params)
      const response = await axiosInstance.get('/stations', {
        params
      })
      
      console.log('Stations API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching stations:', error)
      return rejectWithValue(error.response?.data || 'Failed to fetch stations')
    }
  }
)

// ** Add Station
export const addStation = createAsyncThunk(
  'appStations/addStation', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/stations', data)
      dispatch(fetchStations(getState().stations.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add station')
    }
  }
)

// ** Delete Station
export const deleteStation = createAsyncThunk(
  'appStations/deleteStation', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/stations/${id}`)
      dispatch(fetchStations(getState().stations.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete station')
    }
  }
)

// ** Update Station
export const updateStation = createAsyncThunk(
  'appStations/updateStation',
  async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/stations/${id}`, data)
      dispatch(fetchStations(getState().stations.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update station')
    }
  }
)

export const appStationsSlice = createSlice({
  name: 'appStations',
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
    },
    setParams: (state, action) => {
      state.params = action.payload
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Stations reducers
      .addCase(fetchStations.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false
        // Handle different possible response structures
        if (action.payload && action.payload.data) {
          // If response has a data property
          state.data = action.payload.data
          state.total = action.payload.total || action.payload.data.length || 0
        } else if (Array.isArray(action.payload)) {
          // If response is an array directly
          state.data = action.payload
          state.total = action.payload.length || 0
        } else {
          // Fallback
          state.data = []
          state.total = 0
        }
        state.error = null
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Add Station reducers
      .addCase(addStation.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addStation.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addStation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add station'
      })
      
      // Delete Station reducers
      .addCase(deleteStation.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteStation.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteStation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete station'
      })
      
      // Update Station reducers
      .addCase(updateStation.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateStation.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(updateStation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update station'
      })
  }
})

export const { clearErrors, setParams } = appStationsSlice.actions

export default appStationsSlice.reducer