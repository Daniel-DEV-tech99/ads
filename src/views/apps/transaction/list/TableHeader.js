// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const TableHeader = props => {
  // ** Props
  const { 
    handleFilter, 
    toggle, 
    value, 
    tranKind, 
    handleTranKindChange, 
    minDate, 
    handleMinDateChange, 
    maxDate, 
    handleMaxDateChange, 
    peerUserId, 
    handlePeerUserIdChange,
    customerId,
    handleCustomerIdChange,
    customers,
    vendorId,
    handleVendorIdChange,
    vendors
  } = props

  return (
    <Box
      sx={{
        py: 4,
        px: 6,
        rowGap: 2,
        columnGap: 4
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <CustomTextField
            fullWidth
            value={value}
            placeholder='Search Transaction'
            onChange={e => handleFilter(e.target.value)}
          />
        </Grid>
     
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            id="min-date"
            label="From Date"
            type="date"
                          size='small'

            value={minDate}
            onChange={handleMinDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            id="max-date"
            label="To Date"
            type="date"
                          size='small'

            value={maxDate}
            onChange={handleMaxDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      
     
     
      
        

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button fullWidth onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize='1.125rem' icon='tabler:plus' />
            Add Transaction
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader