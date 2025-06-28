import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AdminAccessButton from '@/components/admin/AdminAccessbutton'
import { Navbar } from '@/components/ui/Navbar'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <Navbar />
        <div className="pt-16">
          {children}
        </div>
        < AdminAccessButton />
      </body>
    </html>
  )
}