import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

const YEAR_MIN = 1000;
const YEAR_MAX = 9999;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function toInt(value: unknown): number | null {
  if (isEmpty(value)) {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return null;
  }
  return n;
}

export function yearTakenValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return { required: true };
  }
  const n = toInt(control.value);
  if (n === null) {
    return { notInteger: true };
  }
  if (n < YEAR_MIN || n > YEAR_MAX) {
    return { yearRange: true };
  }
  return null;
}

export function optionalMonthTakenValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }
  const n = toInt(control.value);
  if (n === null) {
    return { notInteger: true };
  }
  if (n < 1 || n > 12) {
    return { monthRange: true };
  }
  return null;
}

export function optionalDayTakenValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }
  const n = toInt(control.value);
  if (n === null) {
    return { notInteger: true };
  }
  if (n < 1 || n > 31) {
    return { dayRange: true };
  }
  return null;
}

export const partialDateTakenGroupValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const g = group as FormGroup;
  const yearCtrl = g.get('yearTaken');
  const monthCtrl = g.get('monthTaken');
  const dayCtrl = g.get('dayTaken');
  if (!yearCtrl || !monthCtrl || !dayCtrl) {
    return null;
  }

  const y = toInt(yearCtrl.value);
  const m = toInt(monthCtrl.value);
  const d = toInt(dayCtrl.value);

  if (d !== null && m === null) {
    return { dayWithoutMonth: true };
  }

  if (y !== null && m !== null && d !== null) {
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
      return { invalidCalendarDate: true };
    }
  }

  return null;
};
