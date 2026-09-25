import type { MetadataRoute } from 'next'

/** Lets the app be installed to a phone home screen and open without browser chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Streakly',
    short_name: 'Streakly',
    description: 'Build habits that stick.',
    start_url: '/today',
    display: 'standalone',
    background_color: '#07080b',
    theme_color: '#07080b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
