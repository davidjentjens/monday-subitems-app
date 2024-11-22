import { Button, Flex, Modal, ModalContent } from 'monday-ui-react-core'
import { useCallback, useRef, useState } from 'react'
import { DeleteIcon } from 'src/assets/deleteIcon'

interface DeleteCellProps {
  boardId: number | null
  subItemId: string
  deleteSubitem: (_subItemId: string) => Promise<void>
}

export const DeleteCell: React.FC<DeleteCellProps> = ({
  subItemId,
  deleteSubitem,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const openModalButtonRef = useRef<HTMLButtonElement>(null)

  const openModal = useCallback(() => {
    setShowDeleteConfirmation(true)
  }, [])
  const closeModal = useCallback(() => {
    setShowDeleteConfirmation(false)
  }, [])

  const clickDeleteSubitem = async () => {
    closeModal()
    await deleteSubitem(subItemId)
  }

  return (
    <Flex justify={Flex.justify.CENTER}>
      <Modal
        alertDialog
        title="Delete Subitem"
        triggerElement={openModalButtonRef.current as any}
        show={showDeleteConfirmation}
        onClose={closeModal}
        contentSpacing
      >
        <ModalContent>
          <>
            <p style={{ margin: 0, marginBottom: 32 }}>
              Are you sure you want to delete this subitem?
            </p>
            <Flex gap={16} justify={Flex.justify.END}>
              <Button onClick={clickDeleteSubitem} kind={Button.kinds.PRIMARY}>
                Delete
              </Button>
              <Button onClick={closeModal} kind={Button.kinds.SECONDARY}>
                Cancel
              </Button>
            </Flex>
          </>
        </ModalContent>
      </Modal>
      <Button
        onClick={openModal}
        ariaLabel="Delete"
        kind={Button.kinds.TERTIARY}
      >
        <DeleteIcon />
      </Button>
    </Flex>
  )
}
