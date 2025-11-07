import { ReactNode } from 'react'
import { NavbarWrapper } from './navbar-wrapper'
import { Footer } from './footer'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
