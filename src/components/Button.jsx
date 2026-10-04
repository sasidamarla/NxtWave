import { Link } from 'react-router-dom'

/**
 * One Button for the whole site. It renders the right HTML element for the job:
 *  - `to`   -> a router <Link> (navigates inside the app, no page reload)
 *  - `href` -> a normal <a>   (anchors like #register, or external links)
 *  - neither -> a real <button> (submits forms, runs onClick)
 * `loading` shows a spinner and blocks double-clicks (important for forms).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  to,
  href,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
