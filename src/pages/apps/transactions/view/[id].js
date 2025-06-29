// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Import
import axiosInstance from 'src/@core/lib/axiosInstance'

const statusColorMap = {
  completed: 'success',
  pending: 'warning',
  failed: 'error'
}

const TransactionView = () => {
  // ** Router
  const router = useRouter()
  const { id } = router.query

  // ** State
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(`/transactions/${id}`)
        setTransaction(response.data.data)
      } catch (err) {
        console.error('Error fetching transaction:', err)
        setError(err.response?.data?.message || 'Failed to fetch transaction details')
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity='error'>{error}</Alert>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} href='/apps/transactions/list' variant='outlined'>
            Back to Transactions
          </Button>
        </Box>
      </Box>
    )
  }

  if (!transaction) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity='info'>Transaction not found</Alert>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} href='/apps/transactions/list' variant='outlined'>
            Back to Transactions
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Transaction Details'
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  href={`/apps/transactions/edit/${id}`}
                  variant='contained'
                  startIcon={<Icon icon='tabler:edit' />}
                >
                  Edit
                </Button>
                <Button
                  component={Link}
                  href='/apps/transactions/list'
                  variant='outlined'
                  startIcon={<Icon icon='tabler:arrow-left' />}
                >
                  Back
                </Button>
              </Box>
            }
          />
          <Divider sx={{ m: '0 !important' }} />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant='h6'>Transaction #{transaction.id}</Typography>
                  <Chip
                    label={transaction.status}
                    color={statusColorMap[transaction.status] || 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{transaction.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={statusColorMap[transaction.status] || 'default'}
                          size='small'
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell>{transaction.date || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                      <TableCell>{transaction.reference || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell>{transaction.description || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TransactionView