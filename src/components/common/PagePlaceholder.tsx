import { Chip, Paper, Stack, Typography } from '@mui/material'

interface PagePlaceholderProps {
  title: string
  description: string
  highlights?: string[]
}

export function PagePlaceholder({ title, description, highlights = [] }: PagePlaceholderProps) {
  return (
    <Stack spacing={3}>
      <Paper className="bg-white/90" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Paper>

      {highlights.length > 0 && (
        <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Planned Features
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
            {highlights.map((item) => (
              <Chip key={item} label={item} variant="outlined" size="small" />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
