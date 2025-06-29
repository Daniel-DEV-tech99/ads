// ** React Imports
import { useState, useEffect, useRef } from 'react'

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
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

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

// ** Next Imports
import { useRouter } from 'next/router'
import { addMainCategory, fetchMainCategories } from 'src/store/apps/main-categories'

// ** Styled Components
const UploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.action.hover,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '12',
    transform: 'scale(1.02)'
  }
}))

const PreviewCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}))

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[12]
  }
}))

// ** Validation Schema
const schema = yup.object().shape({
  name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
  icon_file: yup.mixed().required('Icon file is required'),
  parent_id: yup.number().nullable()
})

const defaultValues = {
  name: '',
  icon_file: null,
  parent_id: null
}

const CategoryAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, data: categories } = useSelector(state => state.mainCategories)
  const fileInputRef = useRef(null)

  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [iconPreview, setIconPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  // ** Fetch categories for parent dropdown
  useEffect(() => {
    dispatch(fetchMainCategories())
  }, [dispatch])

  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Watch form fields
  const watchedFields = watch()

  // ** Handle file upload
  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setValue('icon_file', file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setIconPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // ** Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // ** Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // ** Remove icon
  const handleRemoveIcon = () => {
    setValue('icon_file', null)
    setIconPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ** Submit handler
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data)
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      if (data.parent_id) {
        formData.append('parent_id', data.parent_id)
      }
      if (data.icon_file) {
        formData.append('icon_file', data.icon_file)
      }
      
      console.log('Sending form data to server')
      
      // Dispatch action to add category
      const result = await dispatch(addMainCategory(formData)).unwrap()
      console.log('Category added successfully:', result)
      
      // Show success message and reset form
      setSubmitSuccess(true)
      reset(defaultValues)
      setIconPreview(null)
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/main-categories/list')
      }, 1500)
    } catch (err) {
      console.error('Error adding category:', err)
      setSubmitError( 'Failed to add category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GradientCard>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Icon icon='tabler:category-plus' fontSize='1.5rem' />
                </Avatar>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 600, mb: 1 }}>
                    Create New Main Category
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Add a new main category with icon and parent relationship
                  </Typography>
                </Box>
              </Box>
            }
          />
          <Divider sx={{ m: '0 !important' }} />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ p: 6 }}>
              <Grid container spacing={6}>
                
                {/* Category Name Section */}
                <Grid item xs={12} md={6}>
                  <PreviewCard sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Icon icon='tabler:writing' fontSize='1.25rem' color='primary' />
                      <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                        Category Details
                      </Typography>
                    </Box>
                    
                    <Controller
                      name='name'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          label='Category Name'
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder='Enter a creative category name...'
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message}
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
                        />
                      )}
                    />

                    {/* Parent Category Selection */}
                    <Box sx={{ mt: 4 }}>
                      <Controller
                        name='parent_id'
                        control={control}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label='Parent Category (Optional)'
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value || null)}
                            onBlur={onBlur}
                            error={Boolean(errors.parent_id)}
                            helperText={errors.parent_id?.message || 'Select a parent category or leave empty for root category'}
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
                            <MenuItem value=''>
                              <em>None (Root Category)</em>
                            </MenuItem>
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
                    </Box>
                  </PreviewCard>
                </Grid>

                {/* Icon Upload Section */}
                <Grid item xs={12} md={6}>
                  <PreviewCard sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Icon icon='tabler:photo-plus' fontSize='1.25rem' color='secondary' />
                      <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                        Category Icon
                      </Typography>
                    </Box>

                    {/* File Upload Area */}
                    <Controller
                      name='icon_file'
                      control={control}
                      render={({ field }) => (
                        <Box>
                          <input
                            type='file'
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            accept='image/*'
                            style={{ display: 'none' }}
                          />
                          
                          {!iconPreview ? (
                            <UploadBox
                              className={dragOver ? 'dragover' : ''}
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mb: 2 }}>
                                <Icon icon='tabler:cloud-upload' fontSize='2rem' />
                              </Avatar>
                              <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
                                Upload Category Icon
                              </Typography>
                              <Typography variant='body2' color='text.secondary' sx={{ mb: 2, textAlign: 'center' }}>
                                Drag & drop an image here or click to browse
                              </Typography>
                              <Chip 
                                label='PNG, JPG, GIF up to 5MB' 
                                size='small' 
                                variant='outlined'
                                sx={{ borderRadius: 2 }}
                              />
                            </UploadBox>
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <Paper 
                                elevation={3} 
                                sx={{ 
                                  p: 3, 
                                  borderRadius: 3,
                                  position: 'relative',
                                  display: 'inline-block',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: 6
                                  }
                                }}
                              >
                                <Avatar 
                                  src={iconPreview} 
                                  sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mx: 'auto',
                                    border: '4px solid',
                                    borderColor: 'primary.main'
                                  }} 
                                />
                                <IconButton
                                  onClick={handleRemoveIcon}
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'error.dark',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                  size='small'
                                >
                                  <Icon icon='tabler:x' fontSize='1rem' />
                                </IconButton>
                              </Paper>
                              <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
                                Click the × to remove or drag a new image to replace
                              </Typography>
                            </Box>
                          )}
                          
                          {errors.icon_file && (
                            <FormHelperText error sx={{ mt: 2, textAlign: 'center' }}>
                              {errors.icon_file.message}
                            </FormHelperText>
                          )}
                        </Box>
                      )}
                    />
                  </PreviewCard>
                </Grid>

                {/* Preview Section */}
                {(watchedFields.name || iconPreview) && (
                  <Grid item xs={12}>
                    <PreviewCard sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Icon icon='tabler:eye' fontSize='1.25rem' color='success' />
                        <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                          Preview
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 3,
                        p: 3,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'primary.main'
                      }}>
                        <Avatar 
                          src={iconPreview} 
                          sx={{ 
                            width: 60, 
                            height: 60,
                            bgcolor: iconPreview ? 'transparent' : 'grey.300'
                          }}
                        >
                          {!iconPreview && <Icon icon='tabler:photo' />}
                        </Avatar>
                        <Box>
                          <Typography variant='h6' sx={{ fontWeight: 600 }}>
                            {watchedFields.name || 'Category Name'}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {watchedFields.parent_id 
                              ? `Child of: ${categories?.find(c => c.id === watchedFields.parent_id)?.name || 'Unknown'}`
                              : 'Root Category'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </PreviewCard>
                  </Grid>
                )}

                {/* Error and Success Messages */}
                {submitError && (
                  <Grid item xs={12}>
                    <Alert 
                      severity='error' 
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem'
                        }
                      }}
                    >
                      {submitError}
                    </Alert>
                  </Grid>
                )}
                
                {submitSuccess && (
                  <Grid item xs={12}>
                    <Alert 
                      severity='success'
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem'
                        }
                      }}
                    >
                     main Category created successfully! Redirecting...
                    </Alert>
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2,
                    pt: 2
                  }}>
                    <Button 
                      variant='outlined' 
                      color='secondary'
                      size='large'
                      startIcon={<Icon icon='tabler:arrow-left' />}
                      onClick={() => router.push('/apps/main-categories/list')}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='contained'
                      size='large'
                      disabled={submitting}
                      startIcon={
                        submitting ? (
                          <CircularProgress size={20} sx={{ color: 'common.white' }} />
                        ) : (
                          <Icon icon='tabler:check' />
                        )
                      }
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 8,
                          background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)'
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)'
                        }
                      }}
                    >
                      {submitting ? 'Creating...' : 'Create main Category'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </GradientCard>
      </Grid>
    </Grid>
  )
}
CategoryAdd.acl = {
  action: 'manage',
  subject: 'manage category'
}
export default CategoryAdd