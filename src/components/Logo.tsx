import { Box, Typography } from '@mui/material'

interface LogoIconProps {
  size?: number
  glow?: boolean
}

/** Ícone da marca: telhado + "S" num quadrado arredondado. */
export function LogoIcon({ size = 32, glow = false }: LogoIconProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 96 96"
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: glow ? 'drop-shadow(0 0 10px rgba(255,79,163,0.55))' : 'none',
      }}
    >
      <rect x="3" y="3" width="90" height="90" rx="24" fill="#0D0408" stroke="#FF4FA3" strokeWidth="3" />
      <path
        d="M28 30 L48 17 L68 30"
        fill="none"
        stroke="#FF4FA3"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M61 42 C57 38 53 37 48 37 C41 37 36 41 36 46.5 C36 59 61 54 61 68 C61 74.5 55.5 79 48 79 C42 79 37 77 34 73"
        fill="none"
        stroke="#FFD3EA"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </Box>
  )
}

/** Logotipo completo: "Sobrado's" + "BAR · GESTÃO". */
export function Wordmark({ glow = false }: { glow?: boolean }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        component="div"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: 48,
          lineHeight: 1,
          color: glow ? '#FFD3EA' : 'secondary.main',
          textShadow: glow
            ? '0 0 10px rgba(255,79,163,0.75), 0 0 26px rgba(228,21,126,0.4)'
            : 'none',
        }}
      >
        Sobrado’s
      </Typography>
      <Typography
        component="div"
        sx={{
          mt: 1.5,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.45em',
          // compensa o espaçamento após a última letra
          mr: '-0.45em',
        }}
      >
        <Box component="span" sx={{ color: 'primary.main' }}>BAR</Box>
        <Box component="span" sx={{ color: 'text.primary' }}> · GESTÃO</Box>
      </Typography>
    </Box>
  )
}
