import { Button, TextField } from 'monday-ui-react-core'
import React, { useMemo, useState } from 'react'

interface SubitemInputProps {
  onAdd: (_name: string) => void
}

export const SubitemInput = React.memo(({ onAdd }: SubitemInputProps) => {
  const [newSubitemName, setNewSubitemName] = useState('')
  const [validationError, setValidationError] = useState(false)

  const subItemNameValidation = useMemo(() => {
    const isValid = newSubitemName.length > 0
    if (!validationError || isValid) {
      return { status: 'success' as any, text: '' }
    }
    return { status: 'error', text: 'Name cannot be empty' }
  }, [newSubitemName.length, validationError])

  const handleAdd = () => {
    if (newSubitemName.length === 0) {
      setValidationError(true)
      return
    }
    setValidationError(false)
    onAdd(newSubitemName)
    setNewSubitemName('')
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, width: '100%' }}>
      <TextField
        value={newSubitemName}
        onChange={setNewSubitemName}
        placeholder="New subitem name"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        size={TextField.sizes.LARGE}
        validation={subItemNameValidation}
      />
      <Button
        onClick={handleAdd}
        size={Button.sizes.LARGE}
        kind={Button.kinds.PRIMARY}
      >
        + Add Subitem
      </Button>
    </div>
  )
})
SubitemInput.displayName = 'SubitemInput'
