import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Logo() {
  const router = useRouter();
  return (
    <button onClick={() => router.push('/')} className="flex items-center gap-2 self-center font-medium">
      <Image src="/images/logo.png" alt="Logo" width={80} height={30} />
      <h1 className="text-base font-bold text-gray-900">
        Survey Platform
      </h1>
    </button>
  )
}