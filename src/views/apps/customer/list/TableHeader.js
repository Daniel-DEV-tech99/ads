// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const TableHeader = props => {
  // ** Props
  const { value, handleFilter, toggle } = props

  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'flex-end' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4, mb: 2 }}
          placeholder='Search Customer'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} onClick={toggle} variant='contained'>
          <Icon icon='tabler:plus' />
          Add New Customer
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeader