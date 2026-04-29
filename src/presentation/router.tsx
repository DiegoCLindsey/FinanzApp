import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AccountsPage from './pages/AccountsPage'
import FixedMovementsPage from './pages/FixedMovementsPage'
import ExtraordinaryMovementsPage from './pages/ExtraordinaryMovementsPage'
import PredictionsPage from './pages/PredictionsPage'
import SettingsPage from './pages/SettingsPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/accounts" replace /> },
        { path: 'accounts', element: <AccountsPage /> },
        { path: 'fixed-movements', element: <FixedMovementsPage /> },
        { path: 'extraordinary-movements', element: <ExtraordinaryMovementsPage /> },
        { path: 'predictions', element: <PredictionsPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
  { basename: '/FinanzApp' }
)
