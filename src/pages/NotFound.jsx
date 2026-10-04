import Button from '../components/Button.jsx'

export default function NotFound() {
  return (
    <div className="container thanks">
      <h1>Page not found</h1>
      <p className="section__intro">That link doesn't lead anywhere. Let's get you back.</p>
      <Button to="/">Back to the workshop</Button>
    </div>
  )
}
