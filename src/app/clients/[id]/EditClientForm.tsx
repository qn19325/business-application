'use client';

import { NI_NUMBER_PATTERN } from '@/schemas/clients';
import { editClient } from './actions';
import { labelClass, inputClass } from '@/components/formStyles';
import FormError from '@/components/FormError';
import FieldError from '@/components/FieldError';
import FormActions from '@/components/FormActions';
import { useActionForm } from '@/hooks/useActionForm';

interface EditClientFormProps {
  clientId: string;
  firstName: string;
  lastName: string;
  niNumber: string;
  email: string;
  phoneNumber: string;
  onClose: () => void;
}

export default function EditClientForm({
  clientId,
  firstName,
  lastName,
  niNumber,
  email,
  phoneNumber,
  onClose,
}: EditClientFormProps) {
  const { formAction, isPending, fieldErrors, formError } = useActionForm(editClient, onClose);

  return (
    <>
      <FormError error={!fieldErrors ? formError : undefined} />
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
              <FieldError fieldErrors={fieldErrors} name="firstName" />
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
              defaultValue={niNumber}
            />
            <FieldError fieldErrors={fieldErrors} name="niNumber" />
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
            <FieldError fieldErrors={fieldErrors} name="email" />
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
              defaultValue={phoneNumber}
            />
            <FieldError fieldErrors={fieldErrors} name="phoneNumber" />
          </div>
        </fieldset>

        <FormActions onClose={onClose} isPending={isPending} submitLabel="Save Changes" />
      </form>
    </>
  );
}
