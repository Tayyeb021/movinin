import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

const LoadingButton = ({ loading = false, disabled, children, ...rest }: LoadingButtonProps) => (
  <Button
    disabled={disabled || loading}
    {...rest}
  >
    {loading && <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />}
    {children}
  </Button>
)

export default LoadingButton
