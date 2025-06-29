// ** React Imports
import { useState, useRef, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { addBannerAd } from 'src/store/apps/banner-ads'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Styled Components
const UploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `3px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(8),
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.action.hover,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 280,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${theme.palette.primary.main}20`,
    '&::before': {
      opacity: 1
    }
  },
  '&.dragover': {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.main + '08',
    transform: 'scale(1.02)',
    boxShadow: `0 25px 50px ${theme.palette.success.main}30`
  }
}))

const PreviewCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 25px 50px ${theme.palette.primary.main}15`
  }
}))

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.secondary.main}12 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 20px 40px ${theme.palette.primary.main}20`
  }
}))

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[12]
  }
}))

// ** Validation Schema
const schema = yup.object().shape({
  sort: yup
    .number()
    .required('Banner sort is required'),
 
  image_file: yup
    .mixed()
    .required('Banner image is required')
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      return !value || (value && value.size <= 5 * 1024 * 1024)
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      return !value || (value && value.type.startsWith('image/'))
    })
})

const defaultValues = {
  sort: '',
  image_file: null
}

const BannerAdAdd = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error } = useSelector(state => state.bannerAds)
  const fileInputRef = useRef(null)

  // ** State
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  // ** Form Hooks
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Watch form fields for preview
  const watchsort = watch('sort')

  // ** Handle file upload with validation
  const handleFileUpload = useCallback((file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Set file and create preview
    setImageFile(file)
    setValue('image_file', file)
    clearErrors('image_file')

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    toast.success('Image uploaded successfully!')
  }, [setValue, clearErrors])

  // ** Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  // ** Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  // ** Remove image
  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    setValue('image_file', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Image removed')
  }, [setValue])



  // ** Submit handler
  const onSubmit = async (data) => {
    if (!imageFile) {
      toast.error('Please upload a banner image')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('sort', data.sort)
      formData.append('image', imageFile)
     
      
      // Dispatch action to add banner ad
      const result = await dispatch(addBannerAd(formData)).unwrap()
      console.log('Banner ad added successfully:', result)
      
      // Show success message
      setSubmitSuccess(true)
      toast.success('Banner ad created successfully!')
      
      // Reset form
      reset(defaultValues)
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Redirect to list page after short delay
      setTimeout(() => {
        router.push('/apps/banner-ads/list')
      }, 2000)
      
    } catch (err) {
      console.error('Error adding banner ad:', err)
      const errorMessage = 'Failed to create banner ad'
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // ** Reset form handler
  const handleReset = useCallback(() => {
    reset(defaultValues)
    setImageFile(null)
    setImagePreview(null)
    setSubmitError(null)
    setSubmitSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Form reset successfully')
  }, [reset])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GradientCard>
          <CardHeader 
            sort={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 56, 
                    height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <Icon icon='tabler:ad-2' fontSize='1.75rem' />
                </Avatar>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    Create New Banner Ad
                  </Typography>
                  <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
                    Design and publish your creative banner advertisement
                  </Typography>
                </Box>
              </Box>
            }
          />
          <Divider sx={{ m: '0 !important' }} />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent sx={{ p: 6 }}>
              <Grid container spacing={6}>
                
                {/* 1. Banner sort Section */}
                <Grid item xs={12} md={6}>
                  <PreviewCard sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Icon icon='tabler:typography' fontSize='1.25rem' color='primary' />
                      <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                        Image sort
                      </Typography>
                    </Box>
                    
                    <Controller
                      name='sort'
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <CustomTextField
                          fullWidth
                          label='Banner sort'
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder='Enter an engaging image sort...'
                          error={Boolean(errors.sort)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Icon icon='tabler:text-caption' />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 4
                              },
                              '&.Mui-focused': {
                                transform: 'translateY(-2px)',
                                boxShadow: 8
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </PreviewCard>
                </Grid>

                {/* Banner Preview Section */}
                {(watchsort || imagePreview) && (
                  <Grid item xs={12} md={6}>
                    <PreviewCard sx={{ p: 4, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Icon icon='tabler:eye' fontSize='1.25rem' color='success' />
                        <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                          Live Preview
                        </Typography>
                      </Box>
                      
                      <Paper 
                        elevation={4}
                        sx={{ 
                          p: 3,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {imagePreview && (
                          <Box
                            component='img'
                            src={imagePreview}
                            alt='Banner Preview'
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 2,
                              mb: 2
                            }}
                          />
                        )}
                        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                          {watchsort || 'Banner sort'}
                        </Typography>
                      </Paper>
                    </PreviewCard>
                  </Grid>
                )}

                {/* 2. Banner Image Upload Section */}
                <Grid item xs={12}>
                  <PreviewCard sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Icon icon='tabler:photo-plus' fontSize='1.5rem' color='primary' />
                      <Typography variant='h6' sx={{ ml: 2, fontWeight: 600 }}>
                        Banner Image
                      </Typography>
                      <Chip 
                        label='Required' 
                        size='small' 
                        color='error'
                        sx={{ ml: 2, fontWeight: 600 }}
                      />
                    </Box>

                    <Controller
                      name='image_file'
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
                          
                          {!imagePreview ? (
                            <UploadBox
                              className={dragOver ? 'dragover' : ''}
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: 'primary.main', 
                                    width: 80, 
                                    height: 80, 
                                    mb: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  }}
                                >
                                  <Icon icon='tabler:cloud-upload' fontSize='2.5rem' />
                                </Avatar>
                                <Typography variant='h5' sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                                  Upload Banner Image
                                </Typography>
                                <Typography variant='body1' color='text.secondary' sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
                                  Drag & drop your creative banner image here or click to browse
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                  <Chip 
                                    label='PNG, JPG, JPEG, GIF' 
                                    size='small' 
                                    variant='outlined'
                                    color='primary'
                                    sx={{ borderRadius: 3, fontWeight: 600 }}
                                  />
                                  <Chip 
                                    label='Max 5MB' 
                                    size='small' 
                                    variant='outlined'
                                    color='secondary'
                                    sx={{ borderRadius: 3, fontWeight: 600 }}
                                  />
                                  <Chip 
                                    label='High Quality' 
                                    size='small' 
                                    variant='outlined'
                                    color='success'
                                    sx={{ borderRadius: 3, fontWeight: 600 }}
                                  />
                                </Box>
                              </Box>
                            </UploadBox>
                          ) : (
                            <ImagePreview>
                              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                                <Paper 
                                  elevation={8} 
                                  sx={{ 
                                    p: 2, 
                                    borderRadius: 4,
                                    position: 'relative',
                                    display: 'inline-block',
                                    background: 'linear-gradient(145deg, #f0f0f0 0%, #ffffff 100%)',
                                    border: '3px solid',
                                    borderColor: 'success.main'
                                  }}
                                >
                                  <Box
                                    component='img'
                                    src={imagePreview}
                                    alt='Banner Preview'
                                    sx={{
                                      maxWidth: '100%',
                                      maxHeight: 300,
                                      borderRadius: 2,
                                      display: 'block'
                                    }}
                                  />
                                  <IconButton
                                    onClick={handleRemoveImage}
                                    sx={{
                                      position: 'absolute',
                                      top: -12,
                                      right: -12,
                                      bgcolor: 'error.main',
                                      color: 'white',
                                      width: 40,
                                      height: 40,
                                      '&:hover': {
                                        bgcolor: 'error.dark',
                                        transform: 'scale(1.1)',
                                        boxShadow: 8
                                      }
                                    }}
                                  >
                                    <Icon icon='tabler:x' fontSize='1.25rem' />
                                  </IconButton>
                                </Paper>
                                <Typography variant='body1' sx={{ mt: 3, color: 'success.main', fontWeight: 600 }}>
                                  ✓ Image uploaded successfully!
                                </Typography>
                                <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                                  Click the × to remove or drag a new image to replace
                                </Typography>
                              </Box>
                            </ImagePreview>
                          )}
                          
                          {errors.image_file && (
                            <FormHelperText error sx={{ mt: 2, textAlign: 'center', fontSize: '1rem' }}>
                              <Icon icon='tabler:alert-circle' style={{ marginRight: 8 }} />
                              {errors.image_file.message}
                            </FormHelperText>
                          )}
                        </Box>
                      )}
                    />
                  </PreviewCard>
                </Grid>



                {/* Error and Success Messages */}
                {submitError && (
                  <Grid item xs={12}>
                    <Alert 
                      severity='error' 
                      sx={{ 
                        borderRadius: 3,
                        fontSize: '1rem',
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem'
                        }
                      }}
                    >
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {submitError}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                {submitSuccess && (
                  <Grid item xs={12}>
                    <Alert 
                      severity='success'
                      sx={{ 
                        borderRadius: 3,
                        fontSize: '1rem',
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem'
                        }
                      }}
                    >
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        Banner ad created successfully! Redirecting...
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 3,
                    pt: 4
                  }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant='outlined' 
                        color='secondary'
                        size='large'
                        startIcon={<Icon icon='tabler:refresh' />}
                        onClick={handleReset}
                        sx={{ 
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        Reset Form
                      </Button>
                      <Button 
                        variant='outlined' 
                        color='primary'
                        size='large'
                        startIcon={<Icon icon='tabler:arrow-left' />}
                        onClick={() => router.push('/apps/banner-ads/list')}
                        sx={{ 
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        Back to List
                      </Button>
                    </Box>
                    
                    <Button
                      type='submit'
                      variant='contained'
                      size='large'
                     
                      startIcon={
                        submitting ? (
                          <CircularProgress size={20} sx={{ color: 'common.white' }} />
                        ) : (
                          <Icon icon='tabler:rocket' />
                        )
                      }
                      sx={{ 
                        borderRadius: 3,
                        px: 6,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                          background: 'linear-gradient(135deg, #667eea 30%, #764ba2 100%)'
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          transform: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {submitting ? 'Creating Banner...' : 'Create Banner Ad'}
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
BannerAdAdd.acl = {
  action: 'manage',
  subject: 'manage banner ad'
}
export default BannerAdAdd