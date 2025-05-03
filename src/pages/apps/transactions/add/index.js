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

const schema = yup.object().shape({
  type: yup.string().required('Transaction type is required'),
  status: yup.string().required('Status is required'),
  date: yup.date().typeError('Date is required').required('Date is required'),
  description: yup.string().nullable(),
  reference: yup.string().nullable()
})

const defaultValues = {
  type: '',
  status: 'pending',
  date: '',
  description: '',
  reference: ''
}

const TransactionAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error } = useSelector(state => state.transaction)

  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const onSubmit = async data => {
    console.log('Form submitted with data:', data)
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Format date to ISO string if it's a Date object
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date
      }
      
      console.log('Sending data to server:', formattedData)
      
      // Dispatch action to add transaction
      const result = await dispatch(addTransaction(formattedData)).unwrap()
      console.log('Transaction added successfully:', result)
      alert('Transaction added successfully')
      
      // Show success message and reset form
      setSubmitSuccess(true)
      reset(defaultValues)
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/transactions/list')
      }, 1500)
    } catch (err) {
      console.error('Error adding transaction:', err)
      alert('Error: ' + (err.message || 'Failed to add transaction'))
      setSubmitError(err.message || 'Failed to add transaction')
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
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={Boolean(errors.type)}>
                      <InputLabel id='transaction-type-label'>Transaction Type</InputLabel>
                      <Controller
                        name='type'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            label='Transaction Type'
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.type)}
                            labelId='transaction-type-label'
                          >
                            <MenuItem value='payment'>Payment</MenuItem>
                            <MenuItem value='refund'>Refund</MenuItem>
                            <MenuItem value='deposit'>Deposit</MenuItem>
                            <MenuItem value='withdrawal'>Withdrawal</MenuItem>
                          </Select>
                        )}
                      />
                      {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={Boolean(errors.status)}>
                      <InputLabel id='transaction-status-label'>Status</InputLabel>
                      <Controller
                        name='status'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            label='Status'
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.status)}
                            labelId='transaction-status-label'
                          >
                            <MenuItem value='completed'>Completed</MenuItem>
                            <MenuItem value='pending'>Pending</MenuItem>
                            <MenuItem value='failed'>Failed</MenuItem>
                          </Select>
                        )}
                      />
                      {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='date'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          type='date'
                          label='Date'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errors.date)}
                          helperText={errors.date?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Reference */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='reference'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          label='Reference'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          placeholder='Transaction reference'
                          error={Boolean(errors.reference)}
                          helperText={errors.reference?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Controller
                      name='description'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          multiline
                          rows={4}
                          label='Description'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          placeholder='Transaction description'
                          error={Boolean(errors.description)}
                          helperText={errors.description?.message}
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

export default TransactionAdd