/**
 * One form field = label + input + hint + error, wired together for accessibility:
 *  - <label htmlFor> so tapping the label focuses the input
 *  - aria-invalid + aria-describedby so screen readers announce the error
 * `as` lets you render an input, select or textarea with the same wiring.
 */
export default function Field({ id, label, as: Tag = 'input', error, hint, required, counter, children, ...props }) {
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {counter && <span className="field__counter">{counter}</span>}
      </label>
      <Tag
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Tag>
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
