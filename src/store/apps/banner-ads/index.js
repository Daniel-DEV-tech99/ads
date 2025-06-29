import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Banner Ads
export const fetchBannerAds = createAsyncThunk(
  'appBannerAds/fetchBannerAds', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/banner-ads', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch banner ads')
    }
  }
)

// ** Fetch Single Banner Ad
export const fetchBannerAd = createAsyncThunk(
  'appBannerAds/fetchBannerAd', 
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/banner-ads/${id}`)
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch banner ad')
    }
  }
)

// ** Add Banner Ad
export const addBannerAd = createAsyncThunk(
  'appBannerAds/addBannerAd', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/banner-ads', data, {
        headers: {
          'Content-Type':'multipart/form-data'
        }
      })
      dispatch(fetchBannerAds())
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add banner ad')
    }
  }
)

// ** Update Banner Ad
export const updateBannerAd = createAsyncThunk(
  'appBannerAds/updateBannerAd', 
  async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data for update:', { id, data });
      const response = await axiosInstance.put(`/banner-ads/${id}`, data)
      console.log('API response:', response.data);
      dispatch(fetchBannerAds(getState().bannerAds.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to update banner ad')
    }
  }
)

// ** Delete Banner Ad
export const deleteBannerAd = createAsyncThunk(
  'appBannerAds/deleteBannerAd', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/banner-ads/${id}`)
      dispatch(fetchBannerAds(getState().bannerAds.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete banner ad')
    }
  }
)

// ** Toggle Banner Ad Status
export const toggleBannerAdStatus = createAsyncThunk(
  'appBannerAds/toggleBannerAdStatus', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/banner-ads/${id}/toggle-status`)
      dispatch(fetchBannerAds(getState().bannerAds.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle banner ad status')
    }
  }
)

// ** Publish Banner Ad
export const publishBannerAd = createAsyncThunk(
  'appBannerAds/publishBannerAd', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/banner-ads/${id}/publish`)
      dispatch(fetchBannerAds(getState().bannerAds.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to publish banner ad')
    }
  }
)

// ** Unpublish Banner Ad
export const unpublishBannerAd = createAsyncThunk(
  'appBannerAds/unpublishBannerAd', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/banner-ads/${id}/unpublish`)
      dispatch(fetchBannerAds(getState().bannerAds.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to unpublish banner ad')
    }
  }
)

export const appBannerAdsSlice = createSlice({
  name: 'appBannerAds',
  initialState: {
    data: [],
    total: 0,
    params: {},
    allData: [],
    selectedBannerAd: null,
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
    clearSelectedBannerAd: state => {
      state.selectedBannerAd = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Banner Ads reducers
      .addCase(fetchBannerAds.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBannerAds.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data || []
        state.total = action.payload.total || action.payload.data?.length || 0
        state.allData = action.payload.allData || action.payload.data || []
        state.error = null
      })
      .addCase(fetchBannerAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Fetch Single Banner Ad reducers
      .addCase(fetchBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBannerAd.fulfilled, (state, action) => {
        state.loading = false
        state.selectedBannerAd = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch banner ad'
      })
      
      // Add Banner Ad reducers
      .addCase(addBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addBannerAd.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add banner ad'
      })
      
      // Update Banner Ad reducers
      .addCase(updateBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBannerAd.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(updateBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update banner ad'
      })
      
      // Delete Banner Ad reducers
      .addCase(deleteBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBannerAd.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete banner ad'
      })
      
      // Toggle Banner Ad Status reducers
      .addCase(toggleBannerAdStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleBannerAdStatus.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(toggleBannerAdStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to toggle banner ad status'
      })
      
      // Publish Banner Ad reducers
      .addCase(publishBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(publishBannerAd.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(publishBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to publish banner ad'
      })
      
      // Unpublish Banner Ad reducers
      .addCase(unpublishBannerAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(unpublishBannerAd.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(unpublishBannerAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to unpublish banner ad'
      })
  }
})

export const { clearErrors, setParams, clearSelectedBannerAd } = appBannerAdsSlice.actions

export default appBannerAdsSlice.reducer