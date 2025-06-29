// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Chip from '@mui/material/Chip'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addAdmin, fetchPermissions } from 'src/store/apps/admin'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  password: yup
    .string()
    .min(6, obj => showErrors('Password', obj.value.length, obj.min))
    .required(),
  phone: yup
    .string()
    .min(10, obj => showErrors('Phone Number', obj.value.length, obj.min))
    .required(),
  permissions: yup
    .array()
    .min(1, 'At least one permission must be selected')
    .required('Permissions are required')
})

const defaultValues = {
  name: '',
  password: '',
  phone: '',
  permissions: []
}

const SidebarAddAdmin = props => {
  // ** Props
  const { open, toggle } = props

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.admin)
  
  useEffect(() => {
    dispatch(fetchPermissions())
  }, [dispatch])

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    // Create FormData object
    const formData = new FormData()
    
    // Append basic fields
    formData.append('name', data.name)
    formData.append('password', data.password)
    formData.append('phone', data.phone)
    
    // Append permissions as an array
    if (data.permissions && data.permissions.length > 0) {
      data.permissions.forEach((permission, index) => {
        formData.append(`permissions[${index}]`, permission)
      })
    }
    
    console.log('Form data being submitted:', data)
    
    dispatch(addAdmin(formData))
      .then(() => {
        toast.success('Admin added successfully!', {
          position: 'bottom-right'
        })
        toggle()
        reset()
      })
      .catch(error => {
        toast.error('Error adding admin: ' + (error.message || 'Unknown error'), {
          position: 'bottom-right'
        })
      })
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Add User</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Name'
                onChange={onChange}
                placeholder='John Doe'
                error={Boolean(errors.name)}
                {...(errors.name && { helperText: errors.name.message })}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='password'
                value={value}
                sx={{ mb: 4 }}
                label='Password'
                onChange={onChange}
                placeholder='********'
                error={Boolean(errors.password)}
                {...(errors.password && { helperText: errors.password.message })}
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Phone'
                onChange={onChange}
                placeholder='(123) 456-7890'
                error={Boolean(errors.phone)}
                {...(errors.phone && { helperText: errors.phone.message })}
              />
            )}
          />
          <FormControl fullWidth error={Boolean(errors.permissions)} sx={{ mb: 6 }}>
            <Controller
              name='permissions'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Select Permissions'
                  id='select-multiple-permissions'
                  error={Boolean(errors.permissions)}
                  SelectProps={{
                    MenuProps,
                    multiple: true,
                    value: value,
                    onChange: onChange,
                    renderValue: selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {selected.map(value => (
                          <Chip 
                            key={value} 
                            label={store.Permissions?.find(p => p.id === value)?.name || value} 
                            sx={{ m: 0.75 }} 
                            skin='light' 
                            color='primary' 
                          />
                        ))}
                      </Box>
                    )
                  }}
                >
                  {store.Permissions && store.Permissions.length > 0 ? (
                    store.Permissions.map(permission => (
                      <MenuItem key={permission.id} value={permission.id}>
                        <Checkbox checked={value.indexOf(permission.id) > -1} />
                        <ListItemText primary={permission.name} />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No permissions available</MenuItem>
                  )}
                </CustomTextField>
              )}
            />
            {errors.permissions && (
              <FormHelperText sx={{ color: 'error.main' }}>
                {errors.permissions.message}
              </FormHelperText>
            )}
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Submit
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default SidebarAddAdmin
