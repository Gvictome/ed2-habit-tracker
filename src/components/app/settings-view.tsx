'use client'

import { KeyRound, LogOut, Monitor, Moon, Palette, Sun, TriangleAlert, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { signOut } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/field'
import { Card } from '@/components/ui/misc'
import { Segmented } from '@/components/ui/segmented'
import { changePassword, deleteOwnAccount } from '@/lib/api'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth-rules'
import { cn } from '@/lib/cn'
import { describeError } from '@/lib/errors'
import { getBrowserClient } from '@/lib/supabase/client'
import type { ThemePreference } from '@/lib/types'
import { useData } from './data-provider'
import { PageHeader } from './page-header'

interface SectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  tone?: 'danger'
}

function Section({ icon, title, description, children, tone }: SectionProps) {
  return (
    <Card className={cn('p-5 sm:p-6', tone === 'danger' && 'border-danger/30')}>
      <div className="flex flex-col gap-5 md:flex-row md:gap-10">
        <div className="md:w-64 md:shrink-0">
          <h2 className={cn('flex items-center gap-2 font-display text-lg font-semibold [&_svg]:size-5', tone === 'danger' && 'text-danger')}>
            {icon}
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </Card>
  )
}

function ProfileSection() {
  const { profile, user, updateProfile } = useData()
  const [name, setName] = useState(profile.display_name)
  const [isSaving, setIsSaving] = useState(false)
  const isDirty = name.trim() !== profile.display_name

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    const ok = await updateProfile({ display_name: name.trim().slice(0, 40) })
    setIsSaving(false)
    if (ok) toast.success('Profile saved')
  }

  return (
    <Section icon={<UserRound />} title="Profile" description="How Streakly greets you.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Display name">
          {(id) => <Input id={id} value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="Your name" />}
        </Field>
        <Field label="Email" hint="The address you log in with.">
          {(id, describedBy) => <Input id={id} value={user.email} disabled aria-describedby={describedBy} />}
        </Field>
        <div>
          <Button type="submit" disabled={!isDirty} isLoading={isSaving}>
            Save profile
          </Button>
        </div>
      </form>
    </Section>
  )
}

function PreferencesSection() {
  const { profile, updateProfile } = useData()
  return (
    <Section icon={<Palette />} title="Preferences" description="Saved to your account, so they follow you to every device.">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">Theme</span>
          <Segmented<ThemePreference>
            label="Theme"
            value={profile.theme}
            onChange={(theme) => updateProfile({ theme })}
            options={[
              { value: 'system', label: <><Monitor /> System</> },
              { value: 'light', label: <><Sun /> Light</> },
              { value: 'dark', label: <><Moon /> Dark</> },
            ]}
            className="w-full sm:w-auto"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">Week starts on</span>
          <Segmented<'1' | '0'>
            label="Week starts on"
            value={String(profile.week_start) as '1' | '0'}
            onChange={(value) => updateProfile({ week_start: Number(value) as 0 | 1 })}
            options={[
              { value: '1', label: 'Monday' },
              { value: '0', label: 'Sunday' },
            ]}
            className="w-full sm:w-auto"
          />
          <p className="text-xs text-muted">Changes the calendar and the Insights heatmap.</p>
        </div>
      </div>
    </Section>
  )
}

function SecuritySection() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    if (password !== confirm) return setError('The two passwords do not match.')
    setError(null)
    setIsSaving(true)
    const { error: updateError } = await changePassword(password)
    setIsSaving(false)
    if (updateError) return setError(describeError(updateError))
    setPassword('')
    setConfirm('')
    toast.success('Password changed')
  }

  return (
    <Section icon={<KeyRound />} title="Security" description="Change your password, or log out of this device.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters`}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <Field label="Confirm password" error={error}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
              />
            )}
          </Field>
        </div>
        <div>
          <Button type="submit" isLoading={isSaving} disabled={!password}>
            Update password
          </Button>
        </div>
      </form>
      <form action={signOut} className="mt-6 border-t border-border pt-5">
        <Button type="submit" variant="secondary">
          <LogOut /> Log out
        </Button>
      </form>
    </Section>
  )
}

function DangerSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const { error } = await deleteOwnAccount()
    if (error) {
      setIsDeleting(false)
      toast.error(describeError(error, 'Could not delete your account.'))
      return
    }
    await getBrowserClient().auth.signOut()
    window.location.assign('/?deleted=1')
  }

  return (
    <Section icon={<TriangleAlert />} title="Danger zone" description="Permanently delete your account and everything in it." tone="danger">
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">
          All habits, logged days, notes, goals, and settings are removed immediately. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete account
        </Button>
      </div>
      <ConfirmDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setTyped('')
        }}
        title="Delete your account?"
        description="Type DELETE to confirm. Your data is erased right away."
        confirmLabel="Delete forever"
        isLoading={isDeleting}
        confirmDisabled={typed !== 'DELETE'}
        onConfirm={handleDelete}
      >
        <Input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="DELETE"
          aria-label="Type DELETE to confirm"
          autoComplete="off"
        />
      </ConfirmDialog>
    </Section>
  )
}

export function SettingsView() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" />
      <div className="flex flex-col gap-4">
        <ProfileSection />
        <PreferencesSection />
        <SecuritySection />
        <DangerSection />
      </div>
    </>
  )
}
