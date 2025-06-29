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
import { fetchMainCategories, deleteMainCategory } from 'src/store/apps/main-categories'

// ** Third Party Components
import axios from 'axios'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/category/list/TableHeader'
import { Avatar } from '@mui/material'

const categoryStatusObj = {
  active: 'success',
  inactive: 'secondary'
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
    dispatch(deleteMainCategory(id))
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
          href={`/apps/main-categories/edit/${id}`}
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
    
    minWidth: 200,
    field: 'icon',
    headerName: 'icon',
    renderCell: ({ row }) => {
      return (
        <Avatar src={row.icon} alt={row.name} sx={{ color: 'text.secondary' }}/>
       
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 280,
    field: 'name',
    headerName: 'Name',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={Link}
              href={`/apps/main-categories/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {row.name}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  
    {
    flex: 0.35,
    minWidth: 280,
    field: 'ads_count',
    headerName: 'ads count',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.ads_count ? row.ads_count :"0"}
        </Typography>
      )
    }
  },
  {
    flex: 0.2,
    minWidth: 150,
    field: 'is_hidden',
    headerName: 'Visibility Status',
    renderCell: ({ row }) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {row.is_hidden === 1 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              <Icon icon='tabler:eye' fontSize={20} />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                Visible
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
              <Icon icon='tabler:eye-off' fontSize={20} />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                Hidden
              </Typography>
            </Box>
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
    renderCell: ({ row }) => <RowOptions id={row.id} />
  }
]

const MainCategoryList = ({ apiData }) => {
  // ** State
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const store = useSelector(state => state.mainCategories)

  useEffect(() => {
    dispatch(
      fetchMainCategories({
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

  const navigateToAddMainCategory = () => router.push('/apps/main-categories/add')

  return (
    <Grid container spacing={6.5}>
   
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Main Categories Filters' />
     
          <TableHeader value={value} handleFilter={handleFilter} toggle={navigateToAddMainCategory} />
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
MainCategoryList.acl = {
  action: 'manage',
  subject: 'manage category'
}
export default MainCategoryList
