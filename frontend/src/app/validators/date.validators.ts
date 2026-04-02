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

export function optionalYearSearchValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
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

function startOfPartialRange(y: number, m: number | null, d: number | null): Date {
  const month = m ?? 1;
  const day = d ?? 1;
  return new Date(y, month - 1, day);
}

function endOfPartialRange(y: number, m: number | null, d: number | null): Date {
  if (m !== null && d !== null) {
    return new Date(y, m - 1, d);
  }
  if (m !== null) {
    return new Date(y, m, 0);
  }
  return new Date(y, 12, 0);
}

function partialSearchDateSideErrors(
  y: number | null,
  m: number | null,
  d: number | null
): ValidationErrors | null {
  if (m !== null && y === null) {
    return { monthWithoutYear: true };
  }
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
}

export const searchPartialDateFromValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const g = group as FormGroup;
  const inner = partialSearchDateSideErrors(
    toInt(g.get('yearFrom')?.value),
    toInt(g.get('monthFrom')?.value),
    toInt(g.get('dayFrom')?.value)
  );
  if (!inner) {
    return null;
  }
  return { searchDateFrom: inner };
};

export const searchPartialDateToValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const g = group as FormGroup;
  const inner = partialSearchDateSideErrors(
    toInt(g.get('yearTo')?.value),
    toInt(g.get('monthTo')?.value),
    toInt(g.get('dayTo')?.value)
  );
  if (!inner) {
    return null;
  }
  return { searchDateTo: inner };
};


export const searchDateRangeOrderValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const g = group as FormGroup;
  const yf = toInt(g.get('yearFrom')?.value);
  const yt = toInt(g.get('yearTo')?.value);
  if (yf === null || yt === null) {
    return null;
  }
  const mf = toInt(g.get('monthFrom')?.value);
  const df = toInt(g.get('dayFrom')?.value);
  const mt = toInt(g.get('monthTo')?.value);
  const dt = toInt(g.get('dayTo')?.value);

  const fromSide = partialSearchDateSideErrors(yf, mf, df);
  const toSide = partialSearchDateSideErrors(yt, mt, dt);
  if (fromSide !== null || toSide !== null) {
    return null;
  }

  const start = startOfPartialRange(yf, mf, df);
  const end = endOfPartialRange(yt, mt, dt);
  if (start.getTime() > end.getTime()) {
    return { searchDateRangeOrder: true };
  }
  return null;
};
