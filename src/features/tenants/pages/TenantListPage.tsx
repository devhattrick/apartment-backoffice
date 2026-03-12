import {
  Button,
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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository } from '../../../services/repositories'
import { ContractStatus } from '../../../types'

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export function TenantListPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const snapshot = databaseRepository.getSnapshot()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL')

  const roomMap = useMemo(() => new Map(snapshot.rooms.map((room) => [room.id, room])), [snapshot.rooms])

  const tenantRows = useMemo(() => {
    return snapshot.tenants.map((tenant) => {
      const contracts = snapshot.contracts
        .filter((contract) => contract.tenantId === tenant.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))

      const currentContract = contracts.find(
        (contract) =>
          contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.PENDING,
      )

      const currentRoom = currentContract ? roomMap.get(currentContract.roomId) : null

      return {
        tenant,
        currentContract,
        currentRoom,
        isActive: Boolean(currentContract),
      }
    })
  }, [roomMap, snapshot.contracts, snapshot.tenants])

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    return tenantRows.filter((row) => {
      const fullName = `${row.tenant.firstName} ${row.tenant.lastName}`.toLowerCase()
      const matchesKeyword =
        !keyword || fullName.includes(keyword) || row.tenant.phone.includes(keyword)
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE' && row.isActive) ||
        (activeFilter === 'INACTIVE' && !row.isActive)

      return matchesKeyword && matchesFilter
    })
  }, [activeFilter, searchKeyword, tenantRows])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {t('Tenant List')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Search tenant profile and inspect current room assignment.')}
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
          <TextField
            size="small"
            label={t('Search name or phone')}
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            sx={{ minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('Filter')}</InputLabel>
            <Select
              value={activeFilter}
              label={t('Filter')}
              onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
            >
              <MenuItem value="ALL">{t('All')}</MenuItem>
              <MenuItem value="ACTIVE">{t('Active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('Inactive')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{t('Phone')}</TableCell>
              <TableCell>{t('Email')}</TableCell>
              <TableCell>{t('Current Room')}</TableCell>
              <TableCell>{t('Contract')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.tenant.id} hover>
                <TableCell>{`${row.tenant.firstName} ${row.tenant.lastName}`}</TableCell>
                <TableCell>{row.tenant.phone}</TableCell>
                <TableCell>{row.tenant.email || '-'}</TableCell>
                <TableCell>
                  {row.currentRoom?.roomNumber ? `${t('Room')} ${row.currentRoom.roomNumber}` : '-'}
                </TableCell>
                <TableCell>{row.currentContract?.contractNo ?? '-'}</TableCell>
                <TableCell>
                  {row.currentContract ? <StatusChip status={row.currentContract.status} /> : t('Inactive')}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => navigate(`/tenants/${row.tenant.id}`)}>
                    {t('View')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}
