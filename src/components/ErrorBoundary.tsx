import { Component, type ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Algo deu errado
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.reload()}
            sx={{ py: 1.5, px: 4 }}
          >
            Recarregar
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
