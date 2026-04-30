'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useState } from 'react';
import createClient from './actions';
import Modal from '@/components/Modal';

const inputClass =
  'w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1';

function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createClient, null);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state, onSuccess]);

  return (
    <>
      {state && !state.success && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <form ref={formRef} action={formAction}>
        <fieldset disabled={isPending} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" name="firstName" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" name="lastName" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>NI Number</label>
            <input
              type="text"
              name="niNumber"
              placeholder="AB 12 34 56 C"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" name="phoneNumber" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Regime</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="regime" value="sa100" defaultChecked />
                SA100
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="regime" value="mtd" />
                MTD
              </label>
            </div>
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onSuccess}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Add Client'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add Client
      </button>
      <Modal title="Add Client" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {isOpen && <AddClientForm onSuccess={() => setIsOpen(false)} />}
      </Modal>
    </div>
  );
}
