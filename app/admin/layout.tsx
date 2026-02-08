'use client'

import { GeistSans } from '@/lib/fonts' // Corrected import
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { auth } from '@/lib/auth' // Import auth for use in Server Components

// This component is now a Server Component
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    // Redirect to login if not authenticated
    // In a Server Component, you can use the redirect function
    // You'll need to import it: import { redirect } from 'next/navigation';
    // For now, returning null or a placeholder might be sufficient if redirect isn't set up globally
    return <div className={cn('admin-layout', GeistSans.variable)}>Please log in to continue.</div>
  }

  // Fetching stats and recent annotations server-side
  const stats = await prisma.articulo.count(); // Fetching counts directly
  const recentAnnotations = await prisma.anotacion.findMany({ // Fetching recent annotations
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      articulo: true,
      createdBy: true,
      tipoAnotacion: true,
    },
  })

  return (
    <div className={cn('admin-layout', GeistSans.variable)}>
      <AdminHeader /> {/* This is a Server Component now */}
      <AdminDashboard
        stats={[stats.articuloCount, stats.anotacionCount, stats.referenciaCount, stats.userCount]} // Assuming these counts are fetched similarly
        recentAnnotations={recentAnnotations}
        session={session} // Pass session data
      />
      <main>{children}</main> {/* Render children for the current page */}
    </div>
  )
}

// Mocked Prisma access or assumed existing prisma client for illustration
const prisma = {
  articulo: { count: async () => 100 },
  anotacion: { count: async () => 500, findMany: async () => [] },
  referencia: { count: async () => 200 },
  user: { count: async () => 50 },
} satisfies any; // Placeholder

// Mock for AdminDashboard props for type checking
interface AdminDashboardProps {
  stats: number[];
  recentAnnotations: any[];
  session: any;
}
// AdminDashboard component would need to be adjusted to receive these as props
// The children prop is where the actual page content (e.g., dashboard, users, audit) will be rendered.
