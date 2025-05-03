// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Next Imports
import { useRouter } from 'next/router'

const TableHeader = props => {
  // ** Props
  const { handleFilter, value } = props

  // ** Router
  const router = useRouter()

  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4, mb: 2 }}
          placeholder='Search Filter'
          onChange={e => handleFilter(e.target.value)}
        />
      </Box>
      <Button sx={{ mb: 2 }} onClick={() => router.push('/apps/filters/add')} variant='contained'>
        <Icon icon='tabler:plus' fontSize={20} />
        Add New Filter
      </Button>
    </Box>
  )
}

export default TableHeader