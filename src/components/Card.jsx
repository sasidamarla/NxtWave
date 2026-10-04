/** A bordered, shadowed box. `tone` picks a background: default | brand | pop | flat. */
export default function Card({ tone = 'default', className = '', children, ...rest }) {
  const cls = ['card', tone !== 'default' && `card--${tone}`, className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}
