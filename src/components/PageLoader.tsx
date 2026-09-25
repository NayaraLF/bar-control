import { Box, CircularProgress } from '@mui/material'

export default function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? '100vh' : 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
