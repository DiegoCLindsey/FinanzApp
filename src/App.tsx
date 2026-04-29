import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/presentation/theme/ThemeContext'
import { router } from '@/presentation/router'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
