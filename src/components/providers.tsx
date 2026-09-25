'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'sonner'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      position="bottom-center"
      offset={88}
      mobileOffset={88}
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border-border-strong !bg-surface !text-foreground !shadow-card !font-sans',
          description: '!text-muted',
        },
      }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  )
}
