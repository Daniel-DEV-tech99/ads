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
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'

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
import { fetchAdmin } from 'src/store/apps/admin'
import { fetchStations } from 'src/store/apps/stations'
import { fetchVendor } from 'src/store/apps/vendor'

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
  transaction_type: yup.string().required('Transaction type is required'),
  peer_user_id: yup.string().required('Recipient selection is required'),
  note: yup.string().nullable().max(500, 'Note cannot exceed 500 characters')
})

const defaultValues = {
  amount: '',
  transaction_type: 'customer',
  peer_user_id: '',
  note: ''
}

const TransactionAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  
  // ** Redux State
  const { data: customers, loading: customersLoading, error: customersError } = useSelector(state => state.user)
  const { data: admins, loading: adminsLoading, error: adminsError } = useSelector(state => state.admin)
  const { data: stations, loading: stationsLoading, error: stationsError } = useSelector(state => state.stations)
  const { data: vendors, loading: vendorsLoading, error: vendorsError } = useSelector(state => state.vendor)
  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // ** Watch transaction type to fetch appropriate data
  const transactionType = watch('transaction_type')

  // ** Effect to fetch data based on transaction type
  useEffect(() => {
    // Reset peer_user_id when transaction type changes
    setValue('peer_user_id', '')
    
    switch (transactionType) {
      case 'customer':
        dispatch(fetchCustomer())
        break
      case 'admin':
        dispatch(fetchAdmin())
        break
      case 'station':
        dispatch(fetchStations())
        break
      case 'vendor':
        dispatch(fetchVendor())
        break
      default:
        dispatch(fetchCustomer())
    }
  }, [dispatch, transactionType, setValue])

  // ** Effect to get user role from local storage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'))
    const storedUserRole = userData && userData.role
    setUserRole(storedUserRole)
    
    // If user is admin and transaction type is admin, reset to customer
    if (storedUserRole === 'admin' && transactionType === 'admin') {
      setValue('transaction_type', 'customer')
      setValue('peer_user_id', '')
    }
    
    // If user is station, set transaction type to vendor
    if (storedUserRole === 'station' && transactionType !== 'vendor') {
      setValue('transaction_type', 'vendor')
      setValue('peer_user_id', '')
    }
  }, [transactionType, setValue])

  // ** Get current data and loading state based on transaction type
  const getCurrentData = () => {
    switch (transactionType) {
      case 'admin':
        return { data: admins || [], loading: adminsLoading, error: adminsError }
      case 'station':
        return { data: stations || [], loading: stationsLoading, error: stationsError }
      case 'vendor':
        return { data: vendors || [], loading: vendorsLoading, error: vendorsError }
      case 'customer':
      default:
        return { data: customers || [], loading: customersLoading, error: customersError }
    }
  }

  const { data: currentData, loading: currentLoading, error: currentError } = getCurrentData()

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

      // Validate recipient selection
      if (!data.peer_user_id) {
        throw new Error('Recipient selection is required')
      }

      // Validate transaction type
      if (!data.transaction_type) {
        throw new Error('Transaction type is required')
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
                  {/* Transaction Type */}
                  <Grid item xs={12}>
                    <FormControl component="fieldset" error={Boolean(errors.transaction_type)}>
                      <FormLabel component="legend">Transaction Type</FormLabel>
                      <Controller
                        name='transaction_type'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <RadioGroup
                            row
                            value={value}
                            onChange={onChange}
                            aria-label="transaction-type"
                          >
                            {userRole === 'station' ? (
                              <FormControlLabel 
                                value="vendor" 
                                control={<Radio />} 
                                label="Vendor" 
                              />
                            ) : (
                              <>
                                <FormControlLabel 
                                  value="customer" 
                                  control={<Radio />} 
                                  label="Customer" 
                                />
                                {userRole !== 'admin' && (
                                  <FormControlLabel 
                                    value="admin" 
                                    control={<Radio />} 
                                    label="Admin" 
                                  />
                                )}
                                <FormControlLabel 
                                  value="station" 
                                  control={<Radio />} 
                                  label="Station" 
                                />
                                <FormControlLabel 
                                  value="vendor" 
                                  control={<Radio />} 
                                  label="Vendor" 
                                />
                              </>
                            )}
                          </RadioGroup>
                        )}
                      />
                      {errors.transaction_type && <FormHelperText>{errors.transaction_type.message}</FormHelperText>}
                    </FormControl>
                  </Grid>

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

                  {/* Recipient Selection */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={Boolean(errors.peer_user_id)}>
                      <InputLabel id='recipient-select-label'>
                        Select {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                      </InputLabel>
                      <Controller
                        name='peer_user_id'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            label={currentLoading ? `Loading ${transactionType}s...` : `Select ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.peer_user_id)}
                            labelId='recipient-select-label'
                            disabled={currentLoading || currentData.length === 0}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 300,
                                },
                              },
                            }}
                          >
                            {currentLoading ? (
                              <MenuItem disabled>
                                <CircularProgress size={20} sx={{ mr: 2 }} />
                                Loading {transactionType}s...
                              </MenuItem>
                            ) : currentData.length === 0 ? (
                              <MenuItem disabled>
                                {currentError ? `Error loading ${transactionType}s` : `No ${transactionType}s available`}
                              </MenuItem>
                            ) : (
                              currentData.map((item) => (
                                <MenuItem 
                                  key={item.id} 
                                  value={item.id}
                                  title={item.email || item.phone || ''}
                                >
                                  {item.name || item.full_name || item.title || `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} ${item.id}`}
                                  {item.email && (
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                      ({item.email})
                                    </Typography>
                                  )}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        )}
                      />
                      {errors.peer_user_id && <FormHelperText>{errors.peer_user_id.message}</FormHelperText>}
                      {currentError && !errors.peer_user_id && (
                        <FormHelperText sx={{ color: 'warning.main' }}>
                          {currentError}
                          <Button 
                            size="small" 
                            onClick={() => {
                              switch (transactionType) {
                                case 'admin':
                                  dispatch(fetchAdmin())
                                  break
                                case 'station':
                                  dispatch(fetchStations())
                                  break
                                case 'vendor':
                                  dispatch(fetchVendor())
                                  break
                                case 'customer':
                                default:
                                  dispatch(fetchCustomer())
                              }
                            }}
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
  subject: 'transaction'
}
export default TransactionAdd