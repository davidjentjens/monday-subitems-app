import { AlertTriangle } from 'lucide-react'
import { AttentionBox } from 'monday-ui-react-core'

export const UpdateNotice: React.FC = () => (
  <div
    style={{
      margin: '16px 0px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <AttentionBox
      compact
      withIconWithoutHeader
      icon={AlertTriangle}
      text="If items are updated on Monday.com, please refresh this page to see the
      changes"
      type={AttentionBox.types.WARNING}
    />
  </div>
)
