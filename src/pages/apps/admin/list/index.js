// ** React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Third Party Components
import axios from 'axios'
import { debounce } from 'lodash'

// ** Custom Table Components Imports
import { fetchAdmin, deleteAdmin } from 'src/store/apps/admin'
import SidebarAddAdmin from 'src/views/apps/admin/list/AddDrawer'
import SidebarEditAdmin from 'src/views/apps/admin/list/EditDrawer'
import TableHeader from 'src/views/apps/admin/list/TableHeader'

// ** renders client column
const renderClient = row => {
  if (row?.avatar?.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor}
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.fullName ? row.fullName : 'John Doe')}
      </CustomAvatar>
    )
  }
}

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, adminName }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the admin {adminName ? `"${adminName}"` : ''}? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const UserList = ({ apiData }) => {
  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)

  // ** Hooks
  const dispatch = useDispatch()
  const { data, loading, error, lastFetch } = useSelector(state => state.admin)

  // Memoized columns definition to prevent unnecessary re-renders
  const columns = useMemo(() => [
    {
      flex: 0.25,
      minWidth: 280,
      field: 'fullName',
      headerName: 'Name',
      renderCell: ({ row }) => {
        const { name } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography>{name}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 190,
      field: 'phone',
      headerName: 'Phone Number',
      renderCell: ({ row }) => {
        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {row.phone}
          </Typography>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 190,
      field: 'created_at',
      headerName: 'Created At',
      renderCell: ({ row }) => {
        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {row.created_at}
          </Typography>
        )
      }
    },
    {
      flex: 0.25,
      minWidth: 250,
      field: 'permissions',
      headerName: 'Permissions',
      renderCell: ({ row }) => {
        // Filter permissions to only show those with value of 1
        const activePermissions = Array.isArray(row.permissions) 
          ? row.permissions.filter(permission => permission.have === 1)
          : [];
          
        return (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            flexDirection: 'row', 
            gap: 1,
            p: 2,
            width: '100%',
            overflow: 'auto',
            overflowY: 'auto'
          }}>
            {activePermissions.length > 0 ? (
              activePermissions.map((permission, index) => (
                <CustomChip
                  key={index}
                  size="small"
                  label={permission.name}
                  skin="light"
                  color="primary"
                  sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px'
                    }
                  }}
                />
              ))
            ) : (
              <Typography noWrap sx={{ color: 'text.secondary' }}>
                No permissions
              </Typography>
            )}
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              size='small' 
              onClick={() => handleEditAdmin(row)}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'rgba(145, 85, 253, 0.08)' }
              }}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
            
            <IconButton 
              size='small' 
              onClick={() => handleDeleteClick(row)}
              sx={{ 
                color: 'error.main',
                '&:hover': { backgroundColor: 'rgba(234, 84, 85, 0.08)' }
              }}
            >
              <Icon icon='tabler:trash' fontSize={20} />
            </IconButton>
          </Box>
        )
      }
    }
  ], [])

  // Fetch data with debounce for search
  const fetchAdminData = useCallback(
    debounce((searchTerm) => {
      const params = searchTerm ? { search: searchTerm } : {}
      dispatch(fetchAdmin(params))
    }, 500),
    [dispatch]
  )

  // Initial data fetch
  useEffect(() => {
    // Only fetch if we don't have data or if it's been more than 5 minutes since last fetch
    const shouldFetch = !data.length || !lastFetch || (Date.now() - lastFetch > 5 * 60 * 1000)
    
    if (shouldFetch) {
      fetchAdminData(searchValue)
    }
  }, [dispatch, fetchAdminData, data.length, lastFetch, searchValue])

  // Handle search input changes
  const handleFilter = useCallback(val => {
    setSearchValue(val)
    fetchAdminData(val)
  }, [fetchAdminData])

  // Handle edit admin
  const handleEditAdmin = useCallback(admin => {
    setSelectedAdmin(admin)
    setEditUserOpen(true)
  }, [])

  // Handle delete click
  const handleDeleteClick = useCallback(admin => {
    setAdminToDelete(admin)
    setDeleteDialogOpen(true)
  }, [])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (adminToDelete) {
      dispatch(deleteAdmin(adminToDelete.id))
    }
    setDeleteDialogOpen(false)
    setAdminToDelete(null)
  }, [dispatch, adminToDelete])

  // Toggle add user drawer
  const toggleAddUserDrawer = useCallback(() => {
    setSelectedAdmin(null)
    setAddUserOpen(!addUserOpen)
  }, [addUserOpen])
  
  // Toggle edit user drawer
  const toggleEditUserDrawer = useCallback(() => {
    setEditUserOpen(!editUserOpen)
    if (!editUserOpen) {
      setSelectedAdmin(null)
    }
  }, [editUserOpen])

  // Filter data based on search value (client-side filtering for better UX)
  const filteredData = useMemo(() => {
    // Ensure data is an array and has items
    if (!Array.isArray(data) || data.length === 0) return []
    
    // If no search term, return all data
    if (!searchValue.trim()) return data

    // Filter data based on search term
    return data.filter(admin => {
      if (!admin) return false
      
      const searchTerm = searchValue.toLowerCase()
      return (
        (admin.name && admin.name.toLowerCase().includes(searchTerm)) ||
        (admin.phone && admin.phone.toLowerCase().includes(searchTerm))
      )
    })
  }, [data, searchValue])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={searchValue} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
          
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error.message || 'Failed to load admin data'}
            </Alert>
          )}
          
          <DataGrid
            rowHeight={72}
            rows={filteredData || []}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            getRowClassName={() => 'custom-row-styling'}
            loading={loading}
            getRowId={(row) => row.id || Math.random().toString(36).substr(2, 9)}
            components={{
              LoadingOverlay: () => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ),
              NoRowsOverlay: () => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">
                    {loading ? 'Loading data...' : 'No admins found'}
                  </Typography>
                </Box>
              )
            }}
            sx={{
              height: 500,
              '& .custom-row-styling': {
                '&:hover': { backgroundColor: theme => theme.palette.action.hover },
                '& .MuiDataGrid-cell': {
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }
              }
            }}
          />
        </Card>
      </Grid>

      {/* Add Admin Drawer */}
      <SidebarAddAdmin open={addUserOpen} toggle={toggleAddUserDrawer} />
      
      {/* Edit Admin Drawer */}
      <SidebarEditAdmin 
        open={editUserOpen} 
        toggle={toggleEditUserDrawer} 
        adminData={selectedAdmin} 
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        adminName={adminToDelete?.name}
      />
    </Grid>
  )
}

UserList.acl = {
  action: 'manage',
  subject: 'manage user'
}

export default UserList
