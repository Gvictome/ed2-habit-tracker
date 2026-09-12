/**
 * Inline stroke icons on a 24px grid. Kept in one file so every icon shares the
 * same weight and line caps, and so nothing depends on an icon package.
 */

function Icon({ size = 20, strokeWidth = 2, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <Icon strokeWidth={3} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  )
}

export function FlameIcon(props) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1.5-.8-2.7-1.6-3.7" />
    </Icon>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Icon>
  )
}

export function ChevronRightIcon(props) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  )
}

export function PlusIcon(props) {
  return (
    <Icon strokeWidth={2.4} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

export function EyeOffIcon(props) {
  return (
    <Icon {...props}>
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6M6.2 6.4A17 17 0 0 0 2 12s3.5 6 10 6a9.8 9.8 0 0 0 4.3-.9" />
      <path d="M3 3l18 18" />
    </Icon>
  )
}
