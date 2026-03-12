import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { userRoleOptions } from '../../../constants/options'
import { userRoleLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { userRepository } from '../../../services/repositories'
import type { User } from '../../../types'
import { UserRole, UserStatus } from '../../../types'

interface UserDraft {
  username: string
  fullName: string
  role: User['role']
}

export function UserManagementPage() {
  const { t } = useI18n()
  const [users, setUsers] = useState<User[]>(() => userRepository.getAll())
  const [openDialog, setOpenDialog] = useState(false)
  const [draft, setDraft] = useState<UserDraft>({
    username: '',
    fullName: '',
    role: UserRole.STAFF,
  })

  const loadUsers = () => {
    setUsers(userRepository.getAll())
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('User Management')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Manage mock users, role assignment and account status.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            {t('Add User')}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('Username')}</TableCell>
              <TableCell>{t('Full Name')}</TableCell>
              <TableCell>{t('Role')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={user.role}
                      onChange={(event) => {
                        userRepository.updateRole(user.id, event.target.value as User['role'])
                        loadUsers()
                      }}
                    >
                      {userRoleOptions.map((role) => (
                        <MenuItem key={role} value={role}>
                          {t(userRoleLabel[role])}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <StatusChip status={user.status} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => {
                      userRepository.toggleStatus(user.id)
                      loadUsers()
                    }}
                  >
                    {user.status === UserStatus.ACTIVE ? t('Disable') : t('Enable')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('Add User')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label={t('Username')}
              value={draft.username}
              onChange={(event) => setDraft((prev) => ({ ...prev, username: event.target.value }))}
            />
            <TextField
              size="small"
              label={t('Full Name')}
              value={draft.fullName}
              onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>{t('Role')}</InputLabel>
              <Select
                label={t('Role')}
                value={draft.role}
                onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value as User['role'] }))}
              >
                {userRoleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(userRoleLabel[role])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            disabled={!draft.username.trim() || !draft.fullName.trim()}
            onClick={() => {
              userRepository.create(draft)
              setOpenDialog(false)
              setDraft({
                username: '',
                fullName: '',
                role: UserRole.STAFF,
              })
              loadUsers()
            }}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
