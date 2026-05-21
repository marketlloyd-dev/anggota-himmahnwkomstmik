import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import AnimatedBackground from '@/components/UI/AnimatedBackground'

export const metadata = {
  title: 'HIMMAH NW - Manajemen Organisasi',
  description: 'Aplikasi manajemen keanggotaan HIMMAH NW Komisariat STMIK SZ NW Anjani',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-himmah-darkest text-white antialiased">
        <AuthProvider>
          <AnimatedBackground />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#0D261C',
                color: '#fff',
                border: '1px solid #319B72',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}