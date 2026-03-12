import type { ChipProps } from '@mui/material'
import { Chip } from '@mui/material'
import { useI18n } from '../../i18n/useI18n'
import {
  billingStatusLabel,
  contractStatusLabel,
  maintenanceStatusLabel,
  paymentStatusLabel,
  reservationStatusLabel,
  roomStatusLabel,
  userRoleLabel,
  userStatusLabel,
} from '../../constants/statusMeta'
import {
  BillingStatus,
  ContractStatus,
  MaintenanceStatus,
  PaymentStatus,
  ReservationStatus,
  RoomStatus,
  UserRole,
  UserStatus,
} from '../../types'

type StatusType =
  | RoomStatus
  | ReservationStatus
  | ContractStatus
  | BillingStatus
  | PaymentStatus
  | MaintenanceStatus
  | UserRole
  | UserStatus

interface StatusChipProps {
  status: StatusType
  size?: ChipProps['size']
  variant?: ChipProps['variant']
}

function resolveStatusLabel(status: StatusType): string {
  if (status in roomStatusLabel) {
    return roomStatusLabel[status as RoomStatus]
  }

  if (status in reservationStatusLabel) {
    return reservationStatusLabel[status as ReservationStatus]
  }

  if (status in contractStatusLabel) {
    return contractStatusLabel[status as ContractStatus]
  }

  if (status in billingStatusLabel) {
    return billingStatusLabel[status as BillingStatus]
  }

  if (status in paymentStatusLabel) {
    return paymentStatusLabel[status as PaymentStatus]
  }

  if (status in maintenanceStatusLabel) {
    return maintenanceStatusLabel[status as MaintenanceStatus]
  }

  if (status in userRoleLabel) {
    return userRoleLabel[status as UserRole]
  }

  return userStatusLabel[status as UserStatus]
}

function resolveStatusColor(status: StatusType): ChipProps['color'] {
  switch (status) {
    case RoomStatus.AVAILABLE:
    case BillingStatus.PAID:
    case PaymentStatus.SUCCESS:
    case MaintenanceStatus.COMPLETED:
    case ReservationStatus.CONVERTED:
    case UserStatus.ACTIVE:
      return 'success'

    case RoomStatus.RESERVED:
    case ContractStatus.PENDING:
    case ReservationStatus.PENDING:
    case PaymentStatus.PENDING:
    case MaintenanceStatus.IN_PROGRESS:
      return 'warning'

    case RoomStatus.OCCUPIED:
    case ContractStatus.ACTIVE:
    case ReservationStatus.CONFIRMED:
    case UserRole.ADMIN:
      return 'primary'

    case RoomStatus.CHECKOUT_PENDING:
    case BillingStatus.PARTIALLY_PAID:
    case UserRole.ACCOUNTANT:
      return 'info'

    case RoomStatus.MAINTENANCE:
    case BillingStatus.OVERDUE:
    case PaymentStatus.FAILED:
    case MaintenanceStatus.OPEN:
    case MaintenanceStatus.CANCELLED:
    case ContractStatus.TERMINATED:
    case ContractStatus.EXPIRED:
    case ReservationStatus.CANCELLED:
    case RoomStatus.UNAVAILABLE:
    case UserStatus.INACTIVE:
      return 'error'

    case RoomStatus.CLEANING:
    case BillingStatus.UNPAID:
    case PaymentStatus.REFUNDED:
    case UserRole.STAFF:
      return 'default'

    default:
      return 'default'
  }
}

export function StatusChip({ status, size = 'small', variant = 'outlined' }: StatusChipProps) {
  const { t } = useI18n()

  return (
    <Chip
      label={t(resolveStatusLabel(status))}
      color={resolveStatusColor(status)}
      size={size}
      variant={variant}
    />
  )
}
