import { geistSans } from '@/lib/fonts'
import { geistMono } from '@/lib/fonts'
import './globals.css'
import './delfino.css'

export const metadata = {
  title: 'Reglamento Asamblea Legislativa CR',
  description: 'Reglamento de la Asamblea Legislativa anotado y comentado por Delfino.cr',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* Apply font variables directly here using the correct variable names */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
