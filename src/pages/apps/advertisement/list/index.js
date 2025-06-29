// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Actions Imports
import { fetchAdvertisements, deleteAdvertisement, toggleAdvertisementStatus, publishAdvertisement, unpublishAdvertisement, approveAdvertisement, rejectAdvertisement } from 'src/store/apps/advertisement'

// ** Third Party Components
import axios from 'axios'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/category/list/TableHeader'

const categoryStatusObj = {
  active: 'success',
  inactive: 'secondary'
}

const RowOptions = ({ id, row }) => {
  // ** Hooks
  const dispatch = useDispatch()

  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = () => {
    dispatch(deleteAdvertisement(id))
    handleRowOptionsClose()
  }

  const handleToggleStatus = () => {
    dispatch(toggleAdvertisementStatus(id))
    handleRowOptionsClose()
  }

  const handlePublish = () => {
    dispatch(publishAdvertisement(id))
    handleRowOptionsClose()
  }

  const handleUnpublish = () => {
    dispatch(unpublishAdvertisement(id))
    handleRowOptionsClose()
  }

  const handleApprove = () => {
    dispatch(approveAdvertisement(id))
    handleRowOptionsClose()
  }

  const handleReject = () => {
    // You might want to add a dialog for rejection reason
    dispatch(rejectAdvertisement({ id, reason: 'Rejected by admin' }))
    handleRowOptionsClose()
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href={`/apps/advertisement/view/${id}`}
          onClick={handleRowOptionsClose}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>
        <MenuItem 
          component={Link}
          href={`/apps/advertisement/edit/${id}`}
          onClick={handleRowOptionsClose} 
          sx={{ '& svg': { mr: 2 } }}
        >
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleStatus} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon={row.is_hidden ? 'tabler:eye' : 'tabler:eye-off'} fontSize={20} />
          {row.is_hidden ? 'Show' : 'Hide'}
        </MenuItem>
        {row.status === 'pending' && (
          <>
            <MenuItem onClick={handleApprove} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='tabler:check' fontSize={20} />
              Approve
            </MenuItem>
            <MenuItem onClick={handleReject} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='tabler:x' fontSize={20} />
              Reject
            </MenuItem>
          </>
        )}
        {row.published_at ? (
          <MenuItem onClick={handleUnpublish} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='tabler:eye-off' fontSize={20} />
            Unpublish
          </MenuItem>
        ) : (
          <MenuItem onClick={handlePublish} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='tabler:eye' fontSize={20} />
            Publish
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const ApprovalActions = ({ id, row }) => {
  // ** Hooks
  const dispatch = useDispatch()

  const handleApprove = async () => {
    try {
      await axios.post(`/advertisements/${id}/approve`)
      // Refresh the data after successful approval
      dispatch(fetchAdvertisements({}))
    } catch (error) {
      console.error('Error approving advertisement:', error)
    }
  }

  const handleReject = async () => {
    try {
      await axios.post(`/advertisements/${id}/reject`)
      // Refresh the data after successful rejection
      dispatch(fetchAdvertisements({}))
    } catch (error) {
      console.error('Error rejecting advertisement:', error)
    }
  }

  // Only show buttons if the advertisement is pending approval
  if (row.status !== 'pending') {
    return (
      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
        {row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : 'N/A'}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size='small'
        variant='contained'
        color='success'
        onClick={handleApprove}
        startIcon={<Icon icon='tabler:check' />}
      >
        Approve
      </Button>
      <Button
        size='small'
        variant='contained'
        color='error'
        onClick={handleReject}
        startIcon={<Icon icon='tabler:x' />}
      >
        Reject
      </Button>
    </Box>
  )
}

const columns = [
  {
    flex: 0.2,
    minWidth: 150,
    field: 'image',
    headerName: 'Image',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {row.image_url || row.image ? (
            <Box
              component="img"
              src={row.image_url || row.image}
              alt={row.title || row.name}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon icon='tabler:photo' fontSize={20} />
            </Box>
          )}
        </Box>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'name',
    headerName: 'name',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={Link}
              href={`/apps/advertisement/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {row.name || row.name}
            </Typography>
            {row.description && (
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {row.description.length > 50 ? `${row.description.substring(0, 50)}...` : row.description}
              </Typography>
            )}
          </Box>
        </Box>
      )
    }
  },
 
  {
    flex: 0.15,
    minWidth: 120,
    field: 'currency',
    headerName: 'currency',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.currency ? `${row.currency}` : '-----'}
        </Typography>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 120,
    field: 'price',
    headerName: 'Price',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.price ? `$${row.price}` : '-----'}
        </Typography>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'category',
    headerName: 'category',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.category ? `${row.category.name}` : '-----'}
        </Typography>
      )
    }
  },
   {
    flex: 0.15,
    minWidth: 150,
    field: 'city',
    headerName: 'city',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.city ? `${row.city}` : '-----'}
        </Typography>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'location',
    headerName: 'location',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.location ? `${row.location}` : '-----'}
        </Typography>
      )
    }
  },
  {
    flex: 0.35,
    minWidth: 280,
    field: 'approved_at',
    headerName: 'approved at',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.approved_at ? `${row.approved_at}` : '-----'}
        </Typography>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 200,
    sortable: false,
    field: 'approval_actions',
    headerName: 'Approval Actions',
    renderCell: ({ row }) => <ApprovalActions id={row.id} row={row} />
  },
  {
    flex: 0.1,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row.id} row={row} />
  }
]

const AdvertisementsList = ({ apiData }) => {
  // ** State
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const store = useSelector(state => state.advertisements)

  useEffect(() => {
    dispatch(
      fetchAdvertisements({
        q: value,
        status
      })
    )
  }, [dispatch, status, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setStatus(e.target.value)
  }, [])

  const navigateToAddAdvertisement = () => router.push('/apps/advertisement/add')

  return (
    <Grid container spacing={6.5}>
   
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Advertisements Management' />
     
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={store.data?.list || []}
            columns={columns}
            loading={store.loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export const getStaticProps = async () => {
  const res = await axios.get('/cards/statistics')
  const apiData = res.data

  return {
    props: {
      apiData
    }
  }
}

AdvertisementsList.acl = {
  action: 'manage',
  subject: 'review advertisement'
}
export default AdvertisementsList
