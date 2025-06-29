// ** React Imports
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const TableHeader = props => {
  // ** Props
  const { handleFilter, toggle, value } = props
  const [localValue, setLocalValue] = useState(value)
  const [isTyping, setIsTyping] = useState(false)
  const searchTimeout = useRef(null)

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Handle input change with typing indicator
  const handleInputChange = e => {
    const newValue = e.target.value
    setLocalValue(newValue)
    setIsTyping(true)
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Set new timeout to update search after user stops typing
    searchTimeout.current = setTimeout(() => {
      handleFilter(newValue)
      setIsTyping(false)
    }, 500)
  }

  // Clear search field
  const handleClearSearch = () => {
    setLocalValue('')
    handleFilter('')
  }

  return (
    <Box
      sx={{
        py: 4,
        px: 6,
        rowGap: 2,
        columnGap: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CustomTextField
          value={localValue}
          sx={{ 
            mr: 4,
            width: { xs: '100%', sm: '250px' },
            '& .MuiInputBase-root': {
              borderRadius: 1
            }
          }}
          placeholder='Search admin...'
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon='tabler:search' fontSize={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isTyping ? (
                  <CircularProgress size={20} />
                ) : localValue ? (
                  <IconButton 
                    edge="end" 
                    onClick={handleClearSearch}
                    size="small"
                  >
                    <Icon icon='tabler:x' fontSize={18} />
                  </IconButton>
                ) : null}
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button 
          onClick={toggle} 
          variant='contained' 
          sx={{ 
            '& svg': { mr: 2 },
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme => `0 4px 8px 0 ${theme.palette.primary.main}40`
            }
          }}
        >
          <Icon fontSize='1.125rem' icon='tabler:plus' />
          Add New Admin
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeader
