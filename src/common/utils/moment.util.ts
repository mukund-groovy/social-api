import moment from 'moment-timezone';

export function formatDate(date: Date | string, format = ''): string {
  return moment(date).format(format);
}

export function addDays(date: Date | string, days: number): Date {
  return moment(date).add(days, 'days').toDate();
}

export function subtractDays(date: Date | string, days: number): Date {
  return moment(date).subtract(days, 'days').toDate();
}

export function isAfter(
  date: Date | string,
  dateToCompare: Date | string,
): boolean {
  return moment(date).isAfter(dateToCompare);
}

export function startOfAndFormat(
  unit: moment.unitOfTime.StartOf,
  format = '',
): string {
  return moment().startOf(unit).format(format);
}

export function addToDate(
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  date: Date | string = '',
  format = '',
  timezone = '',
): string {
  let result;

  if (date) {
    result = moment(date).add(amount, unit);
  } else {
    result = moment().add(amount, unit);
  }

  if (timezone) {
    result = result.tz(timezone);
  }

  return result.format(format);
}

export function subtractDate(
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  date: Date | string = '',
  format = '',
  timezone = '',
): string {
  let result;
  if (date) {
    result = moment(date).subtract(amount, unit);
  } else {
    result = moment().subtract(amount, unit);
  }

  if (timezone) {
    result = result.tz(timezone);
  }

  return result.format(format);
}

export function getCurrentTimestamp(): number {
  return parseInt(moment().format('X'));
}

export function getTimestamp(date: Date | string = ''): number {
  return parseInt(moment(date).format('X'));
}

export function getFutureTimestamp(
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
): number {
  return parseInt(moment().add(amount, unit).format('X'));
}

export function generateDate(
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  type: 'start' | 'end' = 'start',
  format = 'YYYY-MM-DDTHH:mm:ss[Z]',
): string {
  const startOf = unit === 'weeks' ? 'isoWeek' : unit;
  if (type == 'start') {
    return moment().subtract(amount, unit).startOf(startOf).format(format);
  } else {
    return moment().subtract(amount, unit).endOf(startOf).format(format);
  }
}

export function getCurrentDate(
  timezone = '',
  format = 'YYYY-MM-DDTHH:mm:ss[Z]',
): string {
  let result = moment();

  if (timezone) {
    result = result.tz(timezone);
  }

  return result.format(format);
}

export function getClosingDate(
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  timezone = '',
): string {
  let result = moment().add(amount, unit);
  if (timezone) {
    result = result.tz(timezone);
  }

  return result.endOf('day').toISOString();
}

export function todayStartDate(timezone: string): Date {
  const result = new Date(moment().tz(timezone).startOf('day').format());
  return result;
}

export function todayEndDate(timezone: string): Date {
  const result = new Date(moment().tz(timezone).endOf('day').format());
  return result;
}

export function endDate(value, timezone = ''): string {
  const result: any = new Date(
    moment(value).tz(timezone).endOf('day').format(),
  );
  return result;
}

//Converts a given date from a specified timezone to its equivalent UTC representation.
export function convertDateToUTC(date, timezone): Date {
  const endDate = new Date(moment(date).tz(timezone).endOf('day').format());
  return endDate;
}
