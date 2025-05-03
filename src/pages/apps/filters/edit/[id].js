// ** React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

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
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchFilterById, updateFilter, fetchFilters } from 'src/store/apps/filters'

// ** Next Imports
import { useRouter } from 'next/router'

const schema = yup.object().shape({
  name: yup.string().required('Filter name is required'),
  parentId: yup.string().nullable(),
  values: yup.array().of(
    yup.object().shape({
      value: yup.string().required('Value is required'),
      parent: yup.string().nullable()
    })
  ).min(1, 'At least one value is required')
})

const defaultValues = {
  name: '',
  parentId: '',
  values: [
    {
      value: '',
      parent: ''
    }
  ]
}

const FilterEdit = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { id } = router.query
  const { data: filters, loading, error, selectedFilter } = useSelector(state => state.filters)
  console.log(selectedFilter)
  // ** State
  const [parentFilters, setParentFilters] = useState([])
  const [parentIdSelected, setParentIdSelected] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formReady, setFormReady] = useState(false)
  
  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // ** Field Array for dynamic values
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'values'
  })

  // Function to handle parent filter selection - memoized to prevent unnecessary re-renders
  const handleParentFilterChange = useCallback((id) => {
    setParentIdSelected(id)
    if (id) {
      dispatch(fetchFilterById(id))
    }
  }, [dispatch])

  // Fetch filters and current filter data on component mount - optimized with useCallback
  const fetchData = useCallback(async () => {
    if (!id) return;
    
    setInitialLoading(true)
    try {
      // Use Promise.all to fetch data in parallel for better performance
      await Promise.all([
        dispatch(fetchFilters()).unwrap(),
        dispatch(fetchFilterById(id)).unwrap()
      ]);
      
      // Set form ready flag to true after data is loaded
      setFormReady(true)
    } catch (error) {
      console.error('Error fetching filter data:', error)
      setSubmitError('Failed to load filter data')
    } finally {
      setInitialLoading(false)
    }
  }, [dispatch, id]);

  // Effect to trigger data fetching
  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [fetchData])

  // Memoize parent filters to prevent unnecessary re-renders
  const availableParentFilters = useMemo(() => {
    if (filters && filters.length > 0) {
      // Filter out the current filter from the parent options to prevent circular references
      return filters.filter(filter => filter.id !== id)
    }
    return []
  }, [filters, id])
  
  // Update parent filters when the memoized value changes
  useEffect(() => {
    setParentFilters(availableParentFilters)
  }, [availableParentFilters])

  // Memoize the form values to prevent unnecessary calculations
  const formValues = useMemo(() => {
    if (selectedFilter && formReady) {
      // Set parent ID if it exists
      const parentId = selectedFilter.parent ? selectedFilter.parent.id : ''
      
      // Prepare values array from filter values
      const values = selectedFilter.values && selectedFilter.values.length > 0
        ? selectedFilter.values.map(value => ({
            value: value.value || '',
            parent: value.parent.id ? value.parent.id : ''
          }))
        : [{ value: '', parent: '' }]
      
      return {
        name: selectedFilter.name || '',
        parentId,
        values
      }
    }
    return null
  }, [selectedFilter, formReady])
  
  // Populate form with filter data when the memoized values change
  useEffect(() => {
    if (formValues) {
      // Set parent ID for parent filter details display
      setParentIdSelected(formValues.parentId)
      
      // Reset form with filter data
      reset(formValues)
    }
  }, [formValues, reset])

  // Memoized submit handler for better performance
  const onSubmit = useCallback(async data => {
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Create FormData object
      const formData = new FormData()
      
      // Add basic filter data
      formData.append('name', data.name)
      
      // Only append parent if it has a value
      if (data.parentId) {
        formData.append('parent', data.parentId)
      }
      
      // Add values data
      data.values.forEach((condition, index) => {
        formData.append(`values[${index}][name]`, condition.value)
        
        // Only append parent if it has a value
        if (condition.parent) {
          formData.append(`values[${index}][parent]`, condition.parent)
        }
      })
      
      // Dispatch action to update filter
      await dispatch(updateFilter({ id, data: formData })).unwrap()
      
      // Show success message
      setSubmitSuccess(true)
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/filters/list')
      }, 1500)
    } catch (err) {
      console.error('Update error:', err)
      setSubmitError(err.message || 'Failed to update filter')
    } finally {
      setSubmitting(false)
    }
  }, [dispatch, id, router])

  // Memoized handlers for better performance
  const handleAddCondition = useCallback(() => {
    append({ value: '', parent: '' })
  }, [append])

  const handleRemoveCondition = useCallback(index => {
    if (fields.length > 1) {
      remove(index)
    }
  }, [fields.length, remove])

  // Show loading state while fetching initial data
  if (initialLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Edit Filter' />
            <Divider sx={{ m: '0 !important' }} />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Edit Filter' />
          <Divider sx={{ m: '0 !important' }} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Grid container spacing={5}>
                {/* Filter Name */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <CustomTextField
                        fullWidth
                        label='Filter Name'
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder='Enter filter name'
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Parent Filter Selection */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='parentId'
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <CustomTextField
                        id='parent-filter-select'
                        select
                        fullWidth
                        label='Parent Filter'
                        value={value}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          onChange(selectedId); // Update form value
                          handleParentFilterChange(selectedId); // Dispatch action to fetch filter details
                        }}
                        onBlur={onBlur}
                        error={Boolean(errors.parentId)}
                        helperText={errors.parentId?.message || 'Select a parent filter (optional)'}
                        size='small'
                        variant='outlined'
                      >
                        <MenuItem value=''>None</MenuItem>
                        {parentFilters.map(filter => (
                          <MenuItem key={filter.id} value={filter.id}>
                            {filter.name}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>
                
                {/* Selected Parent Filter Details */}
                {selectedFilter && parentIdSelected && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mt: 2, mb: 2, p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Selected Parent Filter Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedFilter.name}
                      </Typography>
                      {selectedFilter.values && selectedFilter.values.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Values:</strong>
                          </Typography>
                          <Box component="ul" sx={{ pl: 2 }}>
                            {selectedFilter.values.map((value, index) => (
                              <Typography component="li" variant="body2" key={index}>
                                {value.parent.value}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      )}
                    </Card>
                  </Grid>
                )}

                {/* Dynamic values */}
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{ mb: 4 }}>
                    Filter Values
                  </Typography>
                  
                  {fields.map((field, index) => (
                    <Grid container spacing={3} key={field.id} sx={{ mb: 4 }}>
                      {/* Value Field */}
                      <Grid item xs={12} sm={5}>
                        <Controller
                          name={`values.${index}.value`}
                          control={control}
                          render={({ field: { value, onChange, onBlur } }) => (
                            <CustomTextField
                              fullWidth
                              label='Value'
                              value={value}
                              onChange={onChange}
                              onBlur={onBlur}
                              placeholder='Enter value'
                              error={Boolean(errors.values?.[index]?.value)}
                              helperText={errors.values?.[index]?.value?.message}
                            />
                          )}
                        />
                      </Grid>

                      {/* Parent Selection */}
                      <Grid item xs={12} sm={5}>
                        <Controller
                          name={`values.${index}.parent`}
                          control={control}
                          render={({ field: { value, onChange, onBlur } }) => (
                            <CustomTextField
                              id={`parent-select-${index}`}
                              select
                              fullWidth
                              label='Parent'
                              value={value}
                              onChange={onChange}
                              onBlur={onBlur}
                              error={Boolean(errors.values?.[index]?.parent)}
                              helperText={errors.values?.[index]?.parent?.message || 'Select a parent (optional)'}
                              size='small'
                              variant='outlined'
                            >
                              <MenuItem value=''>None</MenuItem>
                              {selectedFilter && selectedFilter.values && selectedFilter.values.map(filter => (
                                <MenuItem key={filter.parent.id} value={filter.parent.id}>
                                  {filter.parent.value}
                                </MenuItem>
                              ))}
                            </CustomTextField>
                          )}
                        />
                      </Grid>

                      {/* Remove Button */}
                      <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          color='error' 
                          onClick={() => handleRemoveCondition(index)}
                          disabled={fields.length <= 1}
                        >
                          <Icon icon='tabler:trash' />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}

                  {/* Add Condition Button */}
                  <Button
                    variant='outlined'
                    startIcon={<Icon icon='tabler:plus' />}
                    onClick={handleAddCondition}
                    sx={{ mt: 2 }}
                  >
                    Add Condition
                  </Button>
                </Grid>

                {/* Error and Success Messages */}
                {submitError && (
                  <Grid item xs={12}>
                    <Alert severity='error'>{submitError}</Alert>
                  </Grid>
                )}
                
                {submitSuccess && (
                  <Grid item xs={12}>
                    <Alert severity='success'>Filter updated successfully!</Alert>
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={submitting || initialLoading}
                    sx={{ mr: 3 }}
                  >
                    {submitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ color: 'common.white', mr: 1 }} />
                        Updating...
                      </Box>
                    ) : (
                      'Update'
                    )}
                  </Button>
                  <Button 
                    variant='outlined' 
                    color='secondary' 
                    onClick={() => router.push('/apps/filters/list')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    </Grid>
  )
}

export default FilterEdit