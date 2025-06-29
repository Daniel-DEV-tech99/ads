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
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { addCategory } from 'src/store/apps/category'
import { fetchFilters } from 'src/store/apps/filters'

// ** Next Imports
import { useRouter } from 'next/router'
import { fetchMainCategories } from 'src/store/apps/main-categories'

// Field type options
const KEY_TYPE_OPTIONS = [
  { value: 'string', label: 'String' },
  { value: 'integer', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'filter', label: 'Filter' }
]

const schema = yup.object().shape({
  name: yup.string().required('Category name is required'),
  price: yup.number().typeError('Price must be a number').required('Price is required'),
  keys: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Key name is required'),
      type: yup.string().required('Type is required'),
      required: yup.boolean(),
      min: yup.string().when('type', {
        is: type => ['string', 'integer', 'decimal', 'date', 'time'].includes(type),
        then: schema => schema
      }),
      max: yup.string().when('type', {
        is: type => ['string', 'integer', 'decimal', 'date', 'time'].includes(type),
        then: schema => schema
      }),
      filter_id: yup.number().when('type', {
        is: 'filter',
        then: schema => schema.required('Filter is required')
      })
    })
  ).min(1, 'At least one key is required')
})

const defaultValues = {
  name: '',
  price: '',

  keys: [
    {
      name: '',
      type: 'string',
      required: false,
      min: '',
      max: '',
      filter_id: ''
    }
  ]
}

const CategoryAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error } = useSelector(state => state.category)
  const { data: filters } = useSelector(state => state.filters)
  const {  data: categories } = useSelector(state => state.mainCategories)
console.log(categories)
  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [parent_id,setParent_id]=useState('')

  // ** Fetch filters on component mount
  useEffect(() => {
    dispatch(fetchFilters())
  }, [dispatch])

  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // ** Field Array for dynamic keys
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'keys'
  })

  // Watch all form fields
  const watchedFields = watch()

  const onSubmit = async data => {
    console.log('Form submitted with data:', data)
    console.log('Raw parent_id:', data.parent_id, 'Type:', typeof data.parent_id)
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Clean data by removing empty fields
      const cleanedData = {
        name: data.name,
        price: Number(data.price),
        has_price: data.price ? true : false,
        parent_id: parent_id,
        keys: data.keys.map(key => {
          // Create a clean key object
          const cleanKey = { 
            name: key.name,
            type: key.type,
            required: key.required
          }
          
          // Only add non-empty fields based on type
          if (['string', 'integer', 'decimal', 'date', 'time'].includes(key.type)) {
            if (key.min !== '') cleanKey.min = key.min
            if (key.max !== '') cleanKey.max = key.max
          }
          
          if (key.type === 'filter' && key.filter_id) {
            cleanKey.filter_id = key.filter_id
          }
          
          return cleanKey
        })
      }
      
      console.log('Sending cleaned data to server:', cleanedData)
      
      // Dispatch action to add category with cleaned data
      const result = await dispatch(addCategory(cleanedData)).unwrap()
      console.log('Category added successfully:', result)
      alert('Category added successfully')
      
      // Show success message and reset form
      setSubmitSuccess(true)
      reset(defaultValues)
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/categories/list')
      }, 1500)
    } catch (err) {
      console.error('Error adding category:', err)
      alert('Error: ' + ( 'Failed to add category'))
      setSubmitError( 'Failed to add category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddKey = () => {
    append({
      name: '',
      type: 'string',
      required: false,
      min: '',
      max: '',
      filter_id: ''
    })
  }
  // ** Fetch categories for parent dropdown
  useEffect(() => {
    dispatch(fetchMainCategories())
  }, [dispatch])
  const handleRemoveKey = index => {
    if (fields.length > 1) {
      remove(index)
    }
  }
  
  // Helper function to render conditional fields based on type
  const renderConditionalFields = (index, type) => {
    switch(type) {
      case 'string':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.min`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Min Length"
                    placeholder="Min length"
                    error={Boolean(errors.keys?.[index]?.min)}
                    helperText={errors.keys?.[index]?.min?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.max`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Max Length"
                    placeholder="Max length"
                    error={Boolean(errors.keys?.[index]?.max)}
                    helperText={errors.keys?.[index]?.max?.message}
                  />
                )}
              />
            </Grid>
          </>
        )
      case 'integer':
      case 'decimal':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.min`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Min Value"
                    placeholder="Min value"
                    error={Boolean(errors.keys?.[index]?.min)}
                    helperText={errors.keys?.[index]?.min?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.max`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Max Value"
                    placeholder="Max value"
                    error={Boolean(errors.keys?.[index]?.max)}
                    helperText={errors.keys?.[index]?.max?.message}
                  />
                )}
              />
            </Grid>
          </>
        )
      case 'date':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.min`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Min Date"
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.keys?.[index]?.min)}
                    helperText={errors.keys?.[index]?.min?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.max`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Max Date"
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.keys?.[index]?.max)}
                    helperText={errors.keys?.[index]?.max?.message}
                  />
                )}
              />
            </Grid>
          </>
        )
      case 'time':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.min`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="time"
                    label="Min Time"
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.keys?.[index]?.min)}
                    helperText={errors.keys?.[index]?.min?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`keys.${index}.max`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="time"
                    label="Max Time"
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.keys?.[index]?.max)}
                    helperText={errors.keys?.[index]?.max?.message}
                  />
                )}
              />
            </Grid>
          </>
        )
      case 'filter':
        return (
          <Grid item xs={12} sm={12}>
            <Controller
              name={`keys.${index}.filter_id`}
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  id={`filter-select-${index}`}
                  select
                  fullWidth
                  label='Filter'
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={Boolean(errors.keys?.[index]?.filter_id)}
                  helperText={errors.keys?.[index]?.filter_id?.message || 'Select a filter'}
                  size='small'
                  variant='outlined'
                >
                  {filters?.map(filter => (
                    <MenuItem key={filter.id} value={filter.id}>
                      {filter.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
        )
      case 'boolean':
      default:
        return null
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Add New Category' />
          <Divider sx={{ m: '0 !important' }} />
          <Box component="div">
            <CardContent>
              <Grid container spacing={5}>
                {/* Category Name */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <CustomTextField
                        fullWidth
                        label='Category Name'
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder='Enter category name'
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name='parent_id'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label='Parent Category'
                            value={value}
                            onChange={(e) => {
                              console.log('Selected value:', e.target.value, 'Type:', typeof e.target.value);
                              setParent_id(e.target.value)
                              onChange(e.target.value);
                            }}
                            onBlur={onBlur}
                            error={Boolean(errors.parent_id)}
                            helperText={errors.parent_id?.message || 'Select a parent category'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: 2
                                }
                              }
                            }}
                          >
                            {categories?.map(category => (
                              <MenuItem key={category.id} value={category.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Icon icon='tabler:folder' fontSize='1rem' />
                                  {category.name}
                                </Box>
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        )}
                      />
</Grid>
                {/* Price */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='price'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <CustomTextField
                        fullWidth
                        label='Price'
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder='Enter price'
                        error={Boolean(errors.price)}
                        helperText={errors.price?.message}
                      />
                    )}
                  />
                </Grid>

               

                {/* Dynamic Keys */}
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{ mb: 4 }}>
                    Category Keys
                  </Typography>
                  
                  {fields.map((field, index) => (
                    <Box 
                      key={field.id} 
                      sx={{ 
                        mb: 6, 
                        p: 3, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Grid container spacing={3}>
                        {/* Key Name */}
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name={`keys.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                fullWidth
                                label='Key Name'
                                placeholder='Enter key name'
                                error={Boolean(errors.keys?.[index]?.name)}
                                helperText={errors.keys?.[index]?.name?.message}
                              />
                            )}
                          />
                        </Grid>

                        {/* Key Type */}
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name={`keys.${index}.type`}
                            control={control}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <CustomTextField
                                id={`type-select-${index}`}
                                select
                                fullWidth
                                label='Type'
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                error={Boolean(errors.keys?.[index]?.type)}
                                helperText={errors.keys?.[index]?.type?.message || 'Select a type'}
                                size='small'
                                variant='outlined'
                              >
                                {KEY_TYPE_OPTIONS.map(type => (
                                  <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                  </MenuItem>
                                ))}
                              </CustomTextField>
                            )}
                          />
                        </Grid>

                        {/* Required Checkbox */}
                        <Grid item xs={12}>
                          <FormControl>
                            <Controller
                              name={`keys.${index}.required`}
                              control={control}
                              render={({ field }) => (
                                <FormControlLabel
                                  label="Required"
                                  control={
                                    <Checkbox
                                      checked={field.value}
                                      onChange={field.onChange}
                                    />
                                  }
                                />
                              )}
                            />
                          </FormControl>
                        </Grid>

                        {/* Conditional Fields based on type */}
                        {renderConditionalFields(index, watch(`keys.${index}.type`))}

                        {/* Remove Button */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton 
                            color='error' 
                            onClick={() => handleRemoveKey(index)}
                            disabled={fields.length <= 1}
                          >
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  {/* Add Key Button */}
                  <Button
                    variant='outlined'
                    startIcon={<Icon icon='tabler:plus' />}
                    onClick={handleAddKey}
                    sx={{ mt: 2 }}
                  >
                    Add Key
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
                    <Alert severity='success'>Category added successfully!</Alert>
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant='contained'
                    disabled={submitting}
                    sx={{ mr: 3 }}
                    onClick={() => {
                      console.log('Submit button clicked');
                      const data = {
                        name: watchedFields.name,
                        price: watchedFields.price,
                        keys: watchedFields.keys
                      };
                      console.log('Submitting with data:', data);
                      onSubmit(data);
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={24} sx={{ color: 'common.white' }} />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                  <Button 
                    variant='outlined' 
                    color='secondary' 
                    onClick={() => router.push('/apps/categories/list')}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}
CategoryAdd.acl = {
  action: 'manage',
  subject: 'manage category'
}
export default CategoryAdd