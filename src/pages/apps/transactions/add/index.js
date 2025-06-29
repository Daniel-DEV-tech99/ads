// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { addTransaction } from 'src/store/apps/transaction'

// ** Next Imports
import { useRouter } from 'next/router'
import { fetchCustomer } from 'src/store/apps/user'

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Amount must be a valid number')
    .positive('Amount must be greater than 0')
    .required('Amount is required')
    .test('decimal-places', 'Amount can have maximum 2 decimal places', value => {
      if (value === undefined || value === null) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),
  peer_user_id: yup.string().required('Customer selection is required'),
  note: yup.string().nullable().max(500, 'Note cannot exceed 500 characters')
})

const defaultValues = {
  amount: '',
  peer_user_id: '',
  note: ''
}

const TransactionAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { data:customers,loading, error } = useSelector(state => state.user)
console.log(customers)
  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerError, setCustomerError] = useState(null)

  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  

  // ** Effect to fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomer())
  }, [])

  const onSubmit = async data => {
    console.log('Form submitted with data:', data)
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Validate amount format
      const amount = parseFloat(data.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount value')
      }

      // Validate customer selection
      if (!data.peer_user_id) {
        throw new Error('Customer selection is required')
      }

     

      // Format data for submission
      const formattedData = {
        amount: parseFloat(data.amount).toFixed(2), // Ensure 2 decimal places
        peer_user_id: data.peer_user_id,
        note: data.note?.trim() || null, // Trim whitespace and convert empty string to null
      }
      
      
      // Dispatch action to add transaction
      const result = await dispatch(addTransaction(formattedData)).unwrap()
      
      // Show success message and reset form
      setSubmitSuccess(true)
      reset(defaultValues)
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/transactions/list')
      }, 2000)
    } catch (err) {
      console.error('Error adding transaction:', err)
      setSubmitError( 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Add New Transaction' />
          <Divider sx={{ m: '0 !important' }} />
          <Box component="div">
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={5}>
                  {/* Amount */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='amount'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          size='lg'
                          type='number'
                          name='Amount'
                          
                          value={value}
                          onBlur={onBlur}
                          onChange={(e) => {
                            const inputValue = e.target.value
                            // Allow empty string for clearing the field
                            if (inputValue === '') {
                              onChange('')
                              return
                            }
                            // Validate decimal places
                            const regex = /^\d*\.?\d{0,2}$/
                            if (regex.test(inputValue)) {
                              onChange(inputValue)
                            }
                          }}
                          placeholder='0.00'
                          inputProps={{
                            min: 0,
                            step: 0.01,
                            inputMode: 'decimal'
                          }}
                          error={Boolean(errors.amount)}
                          helperText={errors.amount?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Customer Selection */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={Boolean(errors.peer_user_id)}>
                      <InputLabel id='customer-select-label'>
                        Select Customer
                      </InputLabel>
                      <Controller
                        name='peer_user_id'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            label={loadingCustomers ? 'Loading Customers...' : 'Select Customer'}
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.peer_user_id)}
                            labelId='customer-select-label'
                            disabled={loadingCustomers || customers.length === 0}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 300,
                                },
                              },
                            }}
                          >
                            {loadingCustomers ? (
                              <MenuItem disabled>
                                <CircularProgress size={20} sx={{ mr: 2 }} />
                                Loading customers...
                              </MenuItem>
                            ) : customers.length === 0 ? (
                              <MenuItem disabled>
                                {customerError ? 'Error loading customers' : 'No customers available'}
                              </MenuItem>
                            ) : (
                              customers.map((customer) => (
                                <MenuItem 
                                  key={customer.id} 
                                  value={customer.id}
                                  title={customer.email || customer.phone || ''}
                                >
                                  {customer.name || customer.full_name || `Customer ${customer.id}`}
                                  {customer.email && (
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                      ({customer.email})
                                    </Typography>
                                  )}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        )}
                      />
                      {errors.peer_user_id && <FormHelperText>{errors.peer_user_id.message}</FormHelperText>}
                      {customerError && !errors.peer_user_id && (
                        <FormHelperText sx={{ color: 'warning.main' }}>
                          {customerError}
                          <Button 
                            size="small" 
                            onClick={fetchCustomers}
                            sx={{ ml: 1, minWidth: 'auto', p: 0.5 }}
                          >
                            Retry
                          </Button>
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Note */}
                  <Grid item xs={12}>
                    <Controller
                      name='note'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          multiline
                          rows={4}
                          label='Note'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          placeholder='Add a note for this transaction (optional)'
                          error={Boolean(errors.note)}
                          helperText={errors.note?.message || `${(value || '').length}/500 characters`}
                          inputProps={{
                            maxLength: 500
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Error and Success Messages */}
                  {submitError && (
                    <Grid item xs={12}>
                      <Alert severity='error'>{submitError}</Alert>
                    </Grid>
                  )}
                  
                  {submitSuccess && (
                    <Grid item xs={12}>
                      <Alert severity='success'>Transaction added successfully!</Alert>
                    </Grid>
                  )}

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type='button'
                        color='secondary'
                        variant='outlined'
                        sx={{ mr: 3 }}
                        onClick={() => router.push('/apps/transactions/list')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} /> : null}
                      >
                        {submitting ? 'Saving...' : 'Save Transaction'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}
TransactionAdd.acl = {
  action: 'manage',
  subject: 'manage transaction'
}
export default TransactionAdd