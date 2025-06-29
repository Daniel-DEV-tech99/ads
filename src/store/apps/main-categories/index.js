import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Main Categories
export const fetchMainCategories = createAsyncThunk(
  'appMainCategories/fetchMainCategories', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/main-categories', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch main categories')
    }
  }
)

// ** Fetch Single Main Category
export const fetchMainCategory = createAsyncThunk(
  'appMainCategories/fetchMainCategory', 
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/main-categories/${id}`)
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch main category')
    }
  }
)

// ** Add Main Category
export const addMainCategory = createAsyncThunk(
  'appMainCategories/addMainCategory', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
   
      const response = await axiosInstance.post('/main-categories', data, {
        headers: {
                    'Content-Type': 'multipart/form-data'

        }
      })
    
      dispatch(fetchMainCategories())
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add main category')
    }
  }
)

// ** Update Main Category
export const updateMainCategory = createAsyncThunk(
  'appMainCategories/updateMainCategory', 
  async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data for update:', { id, data });
      
      // Determine if we're sending FormData (for file uploads) or regular data
      const isFormData = data instanceof FormData
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      
      const response = await axiosInstance.put(`/main-categories/${id}`, data, { headers })
      console.log('API response:', response.data);
      dispatch(fetchMainCategories(getState().mainCategories.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to update main category')
    }
  }
)

// ** Delete Main Category
export const deleteMainCategory = createAsyncThunk(
  'appMainCategories/deleteMainCategory', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/main-categories/${id}`)
      dispatch(fetchMainCategories(getState().mainCategories.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete main category')
    }
  }
)

export const appMainCategoriesSlice = createSlice({
  name: 'appMainCategories',
  initialState: {
    data: [],
    total: 0,
    params: {},
    allData: [],
    selectedMainCategory: null,
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
    clearSelectedMainCategory: state => {
      state.selectedMainCategory = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Main Categories reducers
      .addCase(fetchMainCategories.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMainCategories.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data || []
        state.total = action.payload.total || action.payload.data?.length || 0
        state.allData = action.payload.allData || action.payload.data || []
        state.error = null
      })
      .addCase(fetchMainCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
      
      // Fetch Single Main Category reducers
      .addCase(fetchMainCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMainCategory.fulfilled, (state, action) => {
        state.loading = false
        state.selectedMainCategory = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchMainCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch main category'
      })
      
      // Add Main Category reducers
      .addCase(addMainCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addMainCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addMainCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add main category'
      })
      
      // Update Main Category reducers
      .addCase(updateMainCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMainCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(updateMainCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update main category'
      })
      
      // Delete Main Category reducers
      .addCase(deleteMainCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMainCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteMainCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete main category'
      })
  }
})

export const { clearErrors, setParams, clearSelectedMainCategory } = appMainCategoriesSlice.actions

export default appMainCategoriesSlice.reducer