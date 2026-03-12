import type { SvgIconComponent } from '@mui/icons-material'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import type { ReactElement } from 'react'
import { matchPath } from 'react-router-dom'
import { BillingListPage } from '../../features/billing/pages/BillingListPage'
import { ContractListPage } from '../../features/contracts/pages/ContractListPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { MaintenanceListPage } from '../../features/maintenance/pages/MaintenanceListPage'
import { PaymentListPage } from '../../features/payments/pages/PaymentListPage'
import { ReportsPage } from '../../features/reports/pages/ReportsPage'
import { ReservationListPage } from '../../features/reservations/pages/ReservationListPage'
import { RoomDetailPage } from '../../features/rooms/pages/RoomDetailPage'
import { RoomListPage } from '../../features/rooms/pages/RoomListPage'
import { SettingsPage } from '../../features/settings/pages/SettingsPage'
import { TenantDetailPage } from '../../features/tenants/pages/TenantDetailPage'
import { TenantListPage } from '../../features/tenants/pages/TenantListPage'
import { UserManagementPage } from '../../features/users/pages/UserManagementPage'

export interface AppRouteItem {
  key: string
  path: string
  absolutePath: string
  labelKey: string
  descriptionKey: string
  icon: SvgIconComponent
  element: ReactElement
  showInNavigation: boolean
  activePrefixMatch?: boolean
}

interface CreateRouteParams {
  key: string
  path: string
  labelKey: string
  descriptionKey: string
  icon: SvgIconComponent
  element: ReactElement
  showInNavigation?: boolean
  activePrefixMatch?: boolean
}

function createRoute({
  key,
  path,
  labelKey,
  descriptionKey,
  icon,
  element,
  showInNavigation = true,
  activePrefixMatch = false,
}: CreateRouteParams): AppRouteItem {
  return {
    key,
    path,
    absolutePath: `/${path}`,
    labelKey,
    descriptionKey,
    icon,
    element,
    showInNavigation,
    activePrefixMatch,
  }
}

export const appRoutes: AppRouteItem[] = [
  createRoute({
    key: 'dashboard',
    path: 'dashboard',
    labelKey: 'Dashboard',
    descriptionKey: 'Overall apartment operations summary',
    icon: DashboardRoundedIcon,
    element: <DashboardPage />,
  }),
  createRoute({
    key: 'room-list',
    path: 'rooms',
    labelKey: 'Room List',
    descriptionKey: 'Room inventory and status management',
    icon: MeetingRoomRoundedIcon,
    element: <RoomListPage />,
    activePrefixMatch: true,
  }),
  createRoute({
    key: 'room-detail',
    path: 'rooms/:roomId',
    labelKey: 'Room Detail',
    descriptionKey: 'Current room profile and related history',
    icon: InfoRoundedIcon,
    element: <RoomDetailPage />,
    showInNavigation: false,
  }),
  createRoute({
    key: 'tenant-list',
    path: 'tenants',
    labelKey: 'Tenant List',
    descriptionKey: 'Tenant directory and contract links',
    icon: PeopleRoundedIcon,
    element: <TenantListPage />,
    activePrefixMatch: true,
  }),
  createRoute({
    key: 'tenant-detail',
    path: 'tenants/:tenantId',
    labelKey: 'Tenant Detail',
    descriptionKey: 'Tenant profile and payment timeline',
    icon: PersonRoundedIcon,
    element: <TenantDetailPage />,
    showInNavigation: false,
  }),
  createRoute({
    key: 'reservation-list',
    path: 'reservations',
    labelKey: 'Reservation List',
    descriptionKey: 'Reservation workflow and conversion',
    icon: EventAvailableRoundedIcon,
    element: <ReservationListPage />,
  }),
  createRoute({
    key: 'contract-list',
    path: 'contracts',
    labelKey: 'Contract List',
    descriptionKey: 'Contract lifecycle operations',
    icon: DescriptionRoundedIcon,
    element: <ContractListPage />,
  }),
  createRoute({
    key: 'billing-list',
    path: 'billing',
    labelKey: 'Billing List',
    descriptionKey: 'Monthly billing and invoice generation',
    icon: ReceiptLongRoundedIcon,
    element: <BillingListPage />,
  }),
  createRoute({
    key: 'payment-list',
    path: 'payments',
    labelKey: 'Payment List',
    descriptionKey: 'Payment records and receipt handling',
    icon: PaymentsRoundedIcon,
    element: <PaymentListPage />,
  }),
  createRoute({
    key: 'maintenance-list',
    path: 'maintenance',
    labelKey: 'Maintenance List',
    descriptionKey: 'Maintenance tickets and progress',
    icon: BuildRoundedIcon,
    element: <MaintenanceListPage />,
  }),
  createRoute({
    key: 'reports',
    path: 'reports',
    labelKey: 'Reports',
    descriptionKey: 'Occupancy and financial insights',
    icon: AssessmentRoundedIcon,
    element: <ReportsPage />,
  }),
  createRoute({
    key: 'users',
    path: 'users',
    labelKey: 'User Management',
    descriptionKey: 'Backoffice account and role management',
    icon: ManageAccountsRoundedIcon,
    element: <UserManagementPage />,
  }),
  createRoute({
    key: 'settings',
    path: 'settings',
    labelKey: 'Settings',
    descriptionKey: 'System defaults and profile settings',
    icon: SettingsRoundedIcon,
    element: <SettingsPage />,
  }),
]

export const navigationRoutes = appRoutes.filter((route) => route.showInNavigation)

export function findRouteByPath(pathname: string): AppRouteItem | undefined {
  return appRoutes.find((route) => matchPath({ path: route.absolutePath, end: true }, pathname))
}

export function isNavigationRouteActive(route: AppRouteItem, pathname: string): boolean {
  if (pathname === route.absolutePath) {
    return true
  }

  if (route.activePrefixMatch) {
    return pathname.startsWith(`${route.absolutePath}/`)
  }

  return false
}

export const defaultAuthedRoute = '/dashboard'
