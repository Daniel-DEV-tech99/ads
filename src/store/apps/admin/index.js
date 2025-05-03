import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import axiosInstance from 'src/@core/lib/axiosInstance'

// ** Fetch Admins - Single source of truth for fetching admin data
export const fetchAdmin = createAsyncThunk(
  'appAdmin/fetchAdmin', 
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admins', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch admins' })
    }
  }
)

// ** Fetch Permissions with error handling
export const fetchPermissions = createAsyncThunk(
  'appAdmin/fetchPermissions', 
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/permissions', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch permissions' })
    }
  }
)

// ** Add Admin with optimistic update
export const addAdmin = createAsyncThunk(
  'appAdmin/addAdmin', 
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admins', data)
      // Fetch only if needed or use the returned data to update the store
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add admin' })
    }
  }
)

// ** Edit Admin with optimistic update
export const updateAdmin = createAsyncThunk(
  'appAdmin/updateAdmin', 
  async (data, { getState, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/admins/${data.id}`, data.formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update admin' })
    }
  }
)

// ** Delete Admin with optimistic update
export const deleteAdmin = createAsyncThunk(
  'appAdmin/deleteAdmin', 
  async (id, { getState, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/admins/${id}`, { data: id })
      return { id, response: response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete admin' })
    }
  }
)

export const appAdminSlice = createSlice({
  name: 'appAdmin',
  initialState: {
    data: [],
    Permissions: [],
    total: 1,
    params: {},
    allData: [],
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    // For optimistic updates
    setAdminData: (state, action) => {
      state.data = action.payload
    }
  },
  extraReducers: builder => {
    // Fetch admins
    builder
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.loading = false
        
        // Handle nested response structure
        if (action.payload && action.payload.data) {
          // If data is an array, use it directly
          if (Array.isArray(action.payload.data)) {
            state.data = action.payload.data
          } 
          // If data is a single object with nested data array
          else if (action.payload.data.data && Array.isArray(action.payload.data.data)) {
            state.data = action.payload.data.data
          }
          // If data is a single object, wrap it in an array
          else {
            state.data = [action.payload.data]
          }
        } else {
          // Fallback to the entire payload if no data property
          state.data = Array.isArray(action.payload) ? action.payload : [action.payload]
        }
        
        state.lastFetch = Date.now()
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || { message: 'Something went wrong' }
      })
    
    // Fetch permissions
    builder
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.Permissions = action.payload
      })
    
    // Add admin
    builder
      .addCase(addAdmin.fulfilled, (state, action) => {
        // Extract the new admin from the response
        let newAdmin = null
        
        if (action.payload && action.payload.data) {
          newAdmin = action.payload.data
        } else if (action.payload) {
          newAdmin = action.payload
        }
        
        // Add the new admin to the existing data if valid
        if (newAdmin && newAdmin.id) {
          state.data = Array.isArray(state.data) 
            ? [...state.data, newAdmin] 
            : [newAdmin]
        }
      })
    
    // Update admin
    builder
      .addCase(updateAdmin.fulfilled, (state, action) => {
        // Extract the updated admin from the response
        let updatedAdmin = null
        
        if (action.payload && action.payload.data) {
          updatedAdmin = action.payload.data
        } else if (action.payload) {
          updatedAdmin = action.payload
        }
        
        // Update the admin in the existing data if valid
        if (updatedAdmin && updatedAdmin.id) {
          state.data = Array.isArray(state.data) 
            ? state.data.map(admin => 
                admin.id === updatedAdmin.id ? updatedAdmin : admin
              )
            : [updatedAdmin]
        }
      })
    
    // Delete admin
    builder
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        // Extract the deleted admin ID from the response
        let deletedId = null
        
        if (action.payload && action.payload.id) {
          deletedId = action.payload.id
        } else if (action.payload && action.payload.data && action.payload.data.id) {
          deletedId = action.payload.data.id
        } else if (action.payload && typeof action.payload === 'object') {
          // Try to find id in the response object
          deletedId = action.payload.adminId || action.payload.id
        }
        
        // Remove the admin from the existing data if ID is valid
        if (deletedId) {
          state.data = Array.isArray(state.data)
            ? state.data.filter(admin => admin.id !== deletedId)
            : []
        }
      })
  }
})

export default appAdminSlice.reducer
