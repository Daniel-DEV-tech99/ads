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
import { fetchBannerAds, deleteBannerAd, toggleBannerAdStatus, publishBannerAd, unpublishBannerAd } from 'src/store/apps/banner-ads'

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
    dispatch(deleteBannerAd(id))
    handleRowOptionsClose()
  }

  const handleToggleStatus = () => {
    dispatch(toggleBannerAdStatus(id))
    handleRowOptionsClose()
  }

  const handlePublish = () => {
    dispatch(publishBannerAd(id))
    handleRowOptionsClose()
  }

  const handleUnpublish = () => {
    dispatch(unpublishBannerAd(id))
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
          href={`/apps/banner-ads/edit/${id}`}
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
                width: 120,
                height: 50,
                borderRadius: 1,
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 80,
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
    minWidth: 120,
    field: 'sort',
    headerName: 'sort',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.sort ? `${row.sort}` : '-----'}
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
    renderCell: ({ row }) => <RowOptions id={row.id} row={row} />
  }
]

const BannerAdsList = ({ apiData }) => {
  // ** State
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const store = useSelector(state => state.bannerAds)

  useEffect(() => {
    dispatch(
      fetchBannerAds({
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

  const navigateToAddBannerAd = () => router.push('/apps/banner-ads/add')

  return (
    <Grid container spacing={6.5}>
   
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Banner Ads Management' />
     
          <TableHeader value={value} handleFilter={handleFilter} toggle={navigateToAddBannerAd} />
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

BannerAdsList.acl = {
  action: 'manage',
  subject: 'manage banner ad'
}

export default BannerAdsList
