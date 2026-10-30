import { FormControl, FormGroup, Validators } from '@angular/forms';
import { saMobileValidator } from '../forms/sa-mobile.validator';

export type CheckoutForm = FormGroup<{
  email: FormControl<string>;
  phone: FormControl<string>;
  fullName: FormControl<string>;
  street: FormControl<string>;
  suburb: FormControl<string>;
  city: FormControl<string>;
  province: FormControl<string>;
  postalCode: FormControl<string>;
}>;

export function checkoutForm(): CheckoutForm {
  return new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [saMobileValidator()] }),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    street: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    suburb: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    province: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{4}$/)] }),
  });
}
