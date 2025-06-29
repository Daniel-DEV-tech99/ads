import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Advertisements
export const fetchAdvertisements = createAsyncThunk(
  'appAdvertisements/fetchAdvertisements', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/advertisements', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch advertisements')
    }
  }
)

// ** Fetch Single Advertisement
export const fetchAdvertisement = createAsyncThunk(
  'appAdvertisements/fetchAdvertisement', 
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/advertisements/${id}`)
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch advertisement')
    }
  }
)

// ** Add Advertisement
export const addAdvertisement = createAsyncThunk(
  'appAdvertisements/addAdvertisement', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data:', data);
      const response = await axiosInstance.post('/advertisements', data)
      console.log('API response:', response.data);
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add advertisement')
    }
  }
)

// ** Update Advertisement
export const updateAdvertisement = createAsyncThunk(
  'appAdvertisements/updateAdvertisement', 
  async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data for update:', { id, data });
      const response = await axiosInstance.put(`/advertisements/${id}`, data)
      console.log('API response:', response.data);
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to update advertisement')
    }
  }
)

// ** Delete Advertisement
export const deleteAdvertisement = createAsyncThunk(
  'appAdvertisements/deleteAdvertisement', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/advertisements/${id}`)
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete advertisement')
    }
  }
)

// ** Toggle Advertisement Status
export const toggleAdvertisementStatus = createAsyncThunk(
  'appAdvertisements/toggleAdvertisementStatus', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/advertisements/${id}/toggle-status`)
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle advertisement status')
    }
  }
)

// ** Publish Advertisement
export const publishAdvertisement = createAsyncThunk(
  'appAdvertisements/publishAdvertisement', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/advertisements/${id}/publish`)
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to publish advertisement')
    }
  }
)

// ** Unpublish Advertisement
export const unpublishAdvertisement = createAsyncThunk(
  'appAdvertisements/unpublishAdvertisement', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/advertisements/${id}/unpublish`)
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to unpublish advertisement')
    }
  }
)

// ** Approve Advertisement
export const approveAdvertisement = createAsyncThunk(
  'appAdvertisements/approveAdvertisement', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/advertisements/${id}/approve`)
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to approve advertisement')
    }
  }
)

// ** Reject Advertisement
export const rejectAdvertisement = createAsyncThunk(
  'appAdvertisements/rejectAdvertisement', 
  async ({ id, reason }, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/advertisements/${id}/reject`, { reason })
      dispatch(fetchAdvertisements(getState().advertisements.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reject advertisement')
    }
  }
)

export const appAdvertisementsSlice = createSlice({
  name: 'appAdvertisements',
  initialState: {
    data: [],
    total: 0,
    params: {},
    allData: [],
    selectedAdvertisement: null,
    loading: false,
    error: null
  },
  reducers: {
    clearErrors: state => {
      state.error = null
    },
    setParams: (state, action) => {
      state.params = action.payload
    },
    clearSelectedAdvertisement: state => {
      state.selectedAdvertisement = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Advertisements reducers
      .addCase(fetchAdvertisements.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data || []
        state.total = action.payload.total || action.payload.data?.length || 0
        state.allData = action.payload.allData || action.payload.data || []
        state.error = null
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Fetch Single Advertisement reducers
      .addCase(fetchAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdvertisement.fulfilled, (state, action) => {
        state.loading = false
        state.selectedAdvertisement = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch advertisement'
      })
      
      // Add Advertisement reducers
      .addCase(addAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add advertisement'
      })
      
      // Update Advertisement reducers
      .addCase(updateAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update advertisement'
      })
      
      // Delete Advertisement reducers
      .addCase(deleteAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete advertisement'
      })
      
      // Toggle Advertisement Status reducers
      .addCase(toggleAdvertisementStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleAdvertisementStatus.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(toggleAdvertisementStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to toggle advertisement status'
      })
      
      // Publish Advertisement reducers
      .addCase(publishAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(publishAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(publishAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to publish advertisement'
      })
      
      // Unpublish Advertisement reducers
      .addCase(unpublishAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(unpublishAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(unpublishAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to unpublish advertisement'
      })
      
      // Approve Advertisement reducers
      .addCase(approveAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(approveAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(approveAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to approve advertisement'
      })
      
      // Reject Advertisement reducers
      .addCase(rejectAdvertisement.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectAdvertisement.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(rejectAdvertisement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to reject advertisement'
      })
  }
})

export const { clearErrors, setParams, clearSelectedAdvertisement } = appAdvertisementsSlice.actions

export default appAdvertisementsSlice.reducer