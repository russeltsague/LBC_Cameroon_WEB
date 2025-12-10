import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
// import { Footer } from '@/components/ui/Navbar'
// import AdminAccessButton from '@/components/admin/AdminAccessbutton'

export const metadata: Metadata = {
  title: 'Cameroon Basketball League',
  description: 'Official website of Cameroon Basketball League',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-main font-sans antialiased selection:bg-primary selection:text-white">
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        {/* <Footer /> */}
        {/* <AdminAccessButton /> */}
      </body>
    </html>
  )
}