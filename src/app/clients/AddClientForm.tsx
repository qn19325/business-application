'use client';

import { createClient } from './actions';
import { Regime } from '@/types/clients';
import { NI_NUMBER_PATTERN } from '@/schemas/clients';
import { inputClass, labelClass } from '@/components/formStyles';
import FormError from '@/components/FormError';
import FieldError from '@/components/FieldError';
import FormActions from '@/components/FormActions';
import { useActionForm } from '@/hooks/useActionForm';

export default function AddClientForm({ onClose }: { onClose: () => void }) {
  const { formAction, isPending, fieldErrors, formError } = useActionForm(createClient, onClose);

  return (
    <>
      <FormError error={!fieldErrors ? formError : undefined} />
      <form action={formAction}>
        <fieldset disabled={isPending} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="firstName">
                First Name
              </label>
              <input id="firstName" type="text" name="firstName" required className={inputClass} />
              <FieldError fieldErrors={fieldErrors} name="firstName" />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">
                Last Name
              </label>
              <input id="lastName" type="text" name="lastName" required className={inputClass} />
              <FieldError fieldErrors={fieldErrors} name="lastName" />
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
            />
            <FieldError fieldErrors={fieldErrors} name="niNumber" />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input id="email" type="email" name="email" className={inputClass} />
            <FieldError fieldErrors={fieldErrors} name="email" />
          </div>
          <div>
            <label className={labelClass} htmlFor="phoneNumber">
              Phone
            </label>
            <input id="phoneNumber" type="tel" name="phoneNumber" className={inputClass} />
            <FieldError fieldErrors={fieldErrors} name="phoneNumber" />
          </div>
          <div>
            <label className={labelClass}>Regime</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="regime" value={Regime.sa100} defaultChecked />
                SA100
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="regime" value={Regime.mtd} />
                MTD
              </label>
            </div>
            <FieldError fieldErrors={fieldErrors} name="regime" />
          </div>
        </fieldset>

        <FormActions onClose={onClose} isPending={isPending} submitLabel="Add Client" />
      </form>
    </>
  );
}
