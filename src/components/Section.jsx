/**
 * A page section with consistent spacing + optional heading block.
 * `id` is what anchor links (#register) jump to.
 */
export default function Section({ id, kicker, title, intro, tone, children }) {
  const cls = ['section', tone && `section--${tone}`].filter(Boolean).join(' ')
  const headingId = id ? `${id}-title` : undefined
  return (
    <section id={id} className={cls} aria-labelledby={title ? headingId : undefined}>
      <div className="container">
        {(kicker || title || intro) && (
          <header className="section__head">
            {kicker && <span className="section__kicker">{kicker}</span>}
            {title && <h2 id={headingId}>{title}</h2>}
            {intro && <p className="section__intro">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
