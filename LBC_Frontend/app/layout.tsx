import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
// import { Footer } from '@/components/ui/Navbar'
// import AdminAccessButton from '@/components/admin/AdminAccessbutton'

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const geistSans = localFont({
  src: [
    {
      path: '../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
})

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
    <html lang="en" className={`${inter.variable} ${geistSans.variable}`}>
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