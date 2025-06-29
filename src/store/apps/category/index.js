import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Categories
export const fetchData = createAsyncThunk(
  'appCategories/fetchData', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/categories', {
        params
      })
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories')
    }
  }
)

// ** Add Category
export const addCategory = createAsyncThunk(
  'appCategories/addCategory', 
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      console.log('Redux action received data:', data);
      const response = await axiosInstance.post('/categories', data)
      console.log('API response:', response.data);
      dispatch(fetchData(getState().category.params))
      
      return response.data
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add category')
    }
  }
)

// ** Delete Category
export const deleteCategory = createAsyncThunk(
  'appCategories/deleteCategory', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`)
      dispatch(fetchData(getState().category.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete category')
    }
  }
)

// ** Publish/Unpublish Category
export const publishCategory = createAsyncThunk(
  'appCategories/publishCategory', 
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/categories/${id}/publish`)
      dispatch(fetchData(getState().category.params))
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update category visibility')
    }
  }
)

export const appCategoriesSlice = createSlice({
  name: 'appCategories',
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
      // Fetch Categories reducers
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
      
      // Add Category reducers
      .addCase(addCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to add category'
      })
      
      // Delete Category reducers
      .addCase(deleteCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete category'
      })
      
      // Publish Category reducers
      .addCase(publishCategory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(publishCategory.fulfilled, state => {
        state.loading = false
        state.error = null
      })
      .addCase(publishCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update category visibility'
      })
  }
})

export const { clearErrors } = appCategoriesSlice.actions

export default appCategoriesSlice.reducer