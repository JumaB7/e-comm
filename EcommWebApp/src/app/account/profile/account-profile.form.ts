import { FormControl, FormGroup, Validators } from '@angular/forms';
import { saMobileValidator } from '../../forms/sa-mobile.validator';

export type AccountProfileForm = FormGroup<{
  fullName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  street: FormControl<string>;
  suburb: FormControl<string>;
  city: FormControl<string>;
  province: FormControl<string>;
  postalCode: FormControl<string>;
  delivery: FormControl<'courier' | 'collect'>;
  prefillCheckout: FormControl<boolean>;
}>;

export function accountProfileForm(): AccountProfileForm {
  return new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [saMobileValidator()] }),
    street: new FormControl('', { nonNullable: true }),
    suburb: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    province: new FormControl('', { nonNullable: true }),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^$|^\d{4}$/)] }),
    delivery: new FormControl<'courier' | 'collect'>('courier', { nonNullable: true }),
    prefillCheckout: new FormControl(true, { nonNullable: true }),
  });
}
