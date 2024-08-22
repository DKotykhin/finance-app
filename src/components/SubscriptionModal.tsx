'use client';

import React from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { PaymentSettings } from '@/app/(user-pages)/settings/PaymentSettings';

interface SubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  userId: string | null;
  title?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onOpenChange, userId, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      size="5xl"
      className="max-h-[500px] overflow-auto"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <p className="text-center w-full text-gray-500 italic">{title}</p>
            </ModalHeader>
            <ModalBody>
              <PaymentSettings userId={userId} />
            </ModalBody>
            <ModalFooter>
              <Button type="button" color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
