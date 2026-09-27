import Link from 'next/link'
import { buttonClasses } from '@/components/ui/button'
import { Logo } from '@/components/ui/misc'

export default function NotFound() {
  return (
    <main className="bg-aurora grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Logo className="justify-center" />
        <p className="tabular mt-10 font-display text-7xl font-bold text-accent-text">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">This page broke its streak</h1>
        <p className="mt-2 text-sm text-muted">The link may be old, or the page never existed.</p>
        <Link href="/today" className={`${buttonClasses('primary', 'md')} mt-6`}>
          Back to Today
        </Link>
      </div>
    </main>
  )
}
