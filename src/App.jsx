import LeakCalculator from './LeakCalculator'
import SocialDiagnostic from './SocialDiagnostic'

export default function App() {
  const path = window.location.pathname
  if (path.includes('social')) return <SocialDiagnostic />
  return <LeakCalculator />
}