'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import EditClientForm from './EditClientForm';

interface EditClientModalProps {
  id: string;
  niNumber: string; // e.g. AB 12 34 56 C
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

export default function EditClientModal(props: EditClientModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-extrabold text-white hover:bg-indigo-700"
      >
        Edit Client
      </button>
      <Modal title="Edit Client" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* Conditional render remounts EditClientForm on open, resetting useActionState */}
        {isOpen && (
          <EditClientForm
            clientId={props.id}
            firstName={props.firstName}
            lastName={props.lastName}
            niNumber={props.niNumber}
            email={props.email ?? ''}
            phone={props.phoneNumber ?? ''}
            onClose={() => setIsOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
