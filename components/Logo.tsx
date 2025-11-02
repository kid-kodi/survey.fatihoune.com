import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 self-center font-medium">
      <Image src="/images/logo.png" alt="Logo" width={80} height={30} />
      <h1 className="text-base font-bold text-gray-900">
        Survey Platform
      </h1>
    </Link>
  )
}