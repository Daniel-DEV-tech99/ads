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
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Actions Imports
import { fetchData, deleteTransaction } from 'src/store/apps/transaction'

// ** Third Party Components
import axios from 'axios'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/transaction/list/TableHeader'

const transactionStatusObj = {
  completed: 'success',
  pending: 'warning',
  failed: 'error'
}

const RowOptions = ({ id }) => {
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
    dispatch(deleteTransaction(id))
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
          href={`/apps/transactions/view/${id}`}
          onClick={handleRowOptionsClose}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>
        <MenuItem 
          component={Link}
          href={`/apps/transactions/edit/${id}`}
          onClick={handleRowOptionsClose} 
          sx={{ '& svg': { mr: 2 } }}
        >
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const columns = [
  {
    flex: 0.2,
    minWidth: 100,
    field: 'id',
    headerName: 'ID',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.id}
        </Typography>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 180,
    field: 'amount',
    headerName: 'Amount',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={Link}
              href={`/apps/transactions/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              ${row.amount}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 180,
    field: 'type',
    headerName: 'Type',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.type}
        </Typography>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 180,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: transactionStatusObj[row.status] || 'primary.main'
            }}
          >
            <Icon
              icon={
                row.status === 'completed'
                  ? 'tabler:check-circle'
                  : row.status === 'pending'
                  ? 'tabler:clock'
                  : 'tabler:alert-circle'
              }
              fontSize={20}
            />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, textTransform: 'capitalize' }}>
              {row.status}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 180,
    field: 'date',
    headerName: 'Date',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.date ? row.date : "-----"}
        </Typography>
      )
    }
  },
  {
    flex: 0.1,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row.id} />
  }
]

const TransactionList = ({ apiData }) => {
  // ** State
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [tranKind, setTranKind] = useState('')
  const [minDate, setMinDate] = useState('')
  const [maxDate, setMaxDate] = useState('')
  const [peerUserId, setPeerUserId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const store = useSelector(state => state.transaction)

  // Fetch customers and vendors on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get('/customers')
        setCustomers(response.data.data || [])
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }

    const fetchVendors = async () => {
      try {
        const response = await axiosInstance.get('/vendors')
        setVendors(response.data.data || [])
      } catch (error) {
        console.error('Error fetching vendors:', error)
      }
    }

    fetchCustomers()
    fetchVendors()
  }, [])

  // Fetch transactions when filters change
  useEffect(() => {
    dispatch(
      fetchData({
        q: value,
        status,
        tran_kind: tranKind,
        min_date: minDate,
        max_date: maxDate,
        peer_user_id: peerUserId,
        customer_id: customerId,
        vendor_id: vendorId
      })
    )
  }, [dispatch, status, value, tranKind, minDate, maxDate, peerUserId, customerId, vendorId])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setStatus(e.target.value)
  }, [])

  const handleTranKindChange = useCallback(e => {
    setTranKind(e.target.value)
  }, [])

  const handleMinDateChange = useCallback(e => {
    setMinDate(e.target.value)
  }, [])

  const handleMaxDateChange = useCallback(e => {
    setMaxDate(e.target.value)
  }, [])

  const handlePeerUserIdChange = useCallback(e => {
    setPeerUserId(e.target.value)
  }, [])

  const handleCustomerIdChange = useCallback(e => {
    setCustomerId(e.target.value)
  }, [])

  const handleVendorIdChange = useCallback(e => {
    setVendorId(e.target.value)
  }, [])

  const navigateToAddTransaction = () => router.push('/apps/transactions/add')

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Transactions Filters' />
          <TableHeader 
            value={value} 
            handleFilter={handleFilter} 
            toggle={navigateToAddTransaction}
            tranKind={tranKind}
            handleTranKindChange={handleTranKindChange}
            minDate={minDate}
            handleMinDateChange={handleMinDateChange}
            maxDate={maxDate}
            handleMaxDateChange={handleMaxDateChange}
            peerUserId={peerUserId}
            handlePeerUserIdChange={handlePeerUserIdChange}
            customerId={customerId}
            handleCustomerIdChange={handleCustomerIdChange}
            customers={customers}
            vendorId={vendorId}
            handleVendorIdChange={handleVendorIdChange}
            vendors={vendors}
          />
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={store.data}
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

export default TransactionList