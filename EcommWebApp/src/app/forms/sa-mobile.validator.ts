import { AbstractControl, ValidatorFn } from '@angular/forms';

/** South African mobile: 06/07/08 + 8 digits, or +27 / 27 with the same local number. */
export function saMobileValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const raw = String(control.value ?? '').trim();
    if (!raw) {
      return { required: true };
    }
    const digits = raw.replace(/\D/g, '');
    let local = digits;
    if (digits.startsWith('27') && digits.length >= 11) {
      local = `0${digits.slice(2)}`;
    }
    if (!/^0[6-8]\d{8}$/.test(local)) {
      return { mobile: true };
    }
    return null;
  };
}
