/** One sub-score as a labelled bar. value is 0-10. */
export default function ScoreBar({ label, blurb, value }) {
  return (
    <div className="scorebar">
      <div className="scorebar__top">
        <span className="scorebar__label">{label}</span>
        <span className="scorebar__value">{value}/10</span>
      </div>
      <div
        className="scorebar__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
      >
        <div className="scorebar__fill" style={{ width: `${value * 10}%` }} />
      </div>
      <p className="scorebar__blurb">{blurb}</p>
    </div>
  )
}
