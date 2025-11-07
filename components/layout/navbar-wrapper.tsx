import { getCurrentUser } from '@/lib/auth'
import { Navbar } from './navbar'

export async function NavbarWrapper() {
  const user = await getCurrentUser()
  const isAuthenticated = !!user

  return <Navbar isAuthenticated={isAuthenticated} />
}
