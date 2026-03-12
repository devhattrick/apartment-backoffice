import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { authService } from '../../services/auth/authService'
import { findRouteByPath, isNavigationRouteActive, navigationRoutes } from '../routes/routeConfig'

const drawerWidth = 286

export function AppShellLayout() {
  const { locale, setLocale, t } = useI18n()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const currentRoute = useMemo(() => findRouteByPath(location.pathname), [location.pathname])

  const session = authService.getSession()

  const handleNavigate = (path: string) => {
    setMobileOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setMobileOpen(false)
    authService.logout()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <ApartmentRoundedIcon color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('Apartment Backoffice')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('Mock Data Ready')}
            </Typography>
          </Box>
        </Stack>
        <Chip label={t('MVP Phase 1')} size="small" color="primary" variant="outlined" sx={{ mt: 1.75 }} />
      </Box>

      <Divider />

      <List sx={{ px: 1.25, py: 1.5, overflowY: 'auto', flex: 1 }}>
        {navigationRoutes.map((item) => {
          const isActive = isNavigationRouteActive(item, location.pathname)

          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigate(item.absolutePath)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t(item.labelKey)}
                  secondary={t(item.descriptionKey)}
                  slotProps={{
                    secondary: {
                      sx: {
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box className="min-h-screen bg-slate-50" sx={{ display: 'flex' }}>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            ml: { lg: `${drawerWidth}px` },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 68 } }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1.5 }}>
                <MenuRoundedIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Apartment Management')}
              </Typography>
              <Typography variant="h6" noWrap>
                {currentRoute ? t(currentRoute.labelKey) : t('Backoffice')}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Select
                size="small"
                value={locale}
                onChange={(event) => setLocale(event.target.value as 'en' | 'th')}
                sx={{ minWidth: 92, backgroundColor: 'white' }}
              >
                <MenuItem value="en">EN</MenuItem>
                <MenuItem value="th">TH</MenuItem>
              </Select>
              <Chip
                label={session?.username ?? t('staff')}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Tooltip title={t('Logout')}>
                <IconButton onClick={handleLogout}>
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            px: { xs: 2, sm: 3, lg: 4 },
            pt: { xs: 11, sm: 12 },
            pb: { xs: 3, sm: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
