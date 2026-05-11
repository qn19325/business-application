'use client';

import { useActionState, useEffect } from 'react';
import { NI_NUMBER_PATTERN } from '@/schemas/clients';
import { editClient } from './actions';

const inputClass =
  'w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1';

interface EditClientFormProps {
  clientId: string;
  firstName: string;
  lastName: string;
  niNumber: string;
  email: string;
  phone: string;
  onClose: () => void;
}

export default function EditClientForm({
  clientId,
  firstName,
  lastName,
  niNumber,
  email,
  phone,
  onClose,
}: EditClientFormProps) {
  const [state, formAction, isPending] = useActionState(editClient, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <>
      {state && !state.success && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <form action={formAction}>
        <fieldset disabled={isPending} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                required
                className={inputClass}
                defaultValue={firstName}
              />
              {state && !state.success && state.fieldErrors?.['firstName'] && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors['firstName']}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                required
                className={inputClass}
                defaultValue={lastName}
              />
              {state && !state.success && state.fieldErrors?.['lastName'] && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors['lastName']}</p>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="niNumber">
              NI Number
            </label>
            <input
              id="niNumber"
              type="text"
              name="niNumber"
              required
              placeholder="AB 12 34 56 C"
              pattern={NI_NUMBER_PATTERN}
              title="National Insurance number, e.g. AB 12 34 56 C"
              className={`${inputClass} font-mono`}
              defaultValue={niNumber}
            />
            {state && !state.success && state.fieldErrors?.['niNumber'] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors['niNumber']}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className={inputClass}
              defaultValue={email}
            />
            {state && !state.success && state.fieldErrors?.['email'] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors['email']}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="phoneNumber">
              Phone
            </label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              className={inputClass}
              defaultValue={phone}
            />
            {state && !state.success && state.fieldErrors?.['phoneNumber'] && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors['phoneNumber']}</p>
            )}
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </>
  );
}
