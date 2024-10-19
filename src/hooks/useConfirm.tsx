import { useState } from 'react';
import type { JSX } from 'react'; // Add this line

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

export const useConfirm = ({
  title,
  message,
}: {
  title: string;
  message: string;
}): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = () =>
    new Promise<unknown>(resolve => {
      setPromise({ resolve });
    });

  const handleClose = () => setPromise(null);

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmModal = () => (
    <Modal isOpen={promise !== null} onClose={handleCancel}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return [ConfirmModal, confirm];
};
