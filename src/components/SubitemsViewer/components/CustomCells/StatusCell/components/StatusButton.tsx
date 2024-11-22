import { Button, Tooltip } from 'monday-ui-react-core'
import { StatusProps } from 'src/interfaces'

interface StatusButtonProps {
  statusId: string
  statusMap: { [key: string]: StatusProps }
  onClick: () => void
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  statusId,
  statusMap,
  onClick,
}) => {
  const status = statusMap[statusId]

  if (status === undefined) {
    if (statusMap[5] !== undefined) {
      return (
        <Button
          size="small"
          style={{
            width: 150,
            borderRadius: 0,
            backgroundColor: statusMap[5].colorSettings.color,
          }}
          onClick={onClick}
        >
          {statusMap[5].name}
        </Button>
      )
    }

    return (
      <Button
        size="small"
        style={{
          width: 150,
          borderRadius: 0,
          backgroundColor: 'rgb(196, 196, 196)',
        }}
        onClick={onClick}
      />
    )
  }

  return (
    <Tooltip content={status.name}>
      <Button
        size="small"
        style={{
          width: 150,
          borderRadius: 0,
          backgroundColor: status.colorSettings.color,
        }}
        onClick={onClick}
      >
        {status.name}
      </Button>
    </Tooltip>
  )
}
