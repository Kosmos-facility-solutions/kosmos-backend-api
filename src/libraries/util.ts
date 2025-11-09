interface Paginate<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
}

interface ReplaceHoursFromDateToDateParams {
  dateToGetTime: Date;
  dateToSetTime: Date;
}
export const months = [
  { name: 'January', val: 1 },
  { name: 'February', val: 2 },
  { name: 'March', val: 3 },
  { name: 'April', val: 4 },
  { name: 'May', val: 5 },
  { name: 'June', val: 6 },
  { name: 'July', val: 7 },
  { name: 'August', val: 8 },
  { name: 'September', val: 9 },
  { name: 'October', val: 10 },
  { name: 'November', val: 11 },
  { name: 'December', val: 12 },
];

export const weekdays = [
  { name: 'Sunday', val: 0 },
  { name: 'Monday', val: 1 },
  { name: 'Tuesday', val: 2 },
  { name: 'Wednesday', val: 3 },
  { name: 'Thursday', val: 4 },
  { name: 'Friday', val: 5 },
  { name: 'Saturday', val: 6 },
];

export const colors = ['red', 'purple', 'blue', 'light-blue', 'orange'];

export function numberFixedLen(n, len) {
  return (1e4 + '' + n).slice(-len);
}

export function numToMonth(n) {
  return months[n - 1].name;
}

export function replaceHoursFromDateToDate({
  dateToGetTime,
  dateToSetTime,
}: ReplaceHoursFromDateToDateParams) {
  const hours = dateToGetTime.getHours();
  const minutes = dateToGetTime.getMinutes();
  const seconds = dateToGetTime.getSeconds();
  const milliseconds = dateToGetTime.getMilliseconds();

  const newDateToSetTime = new Date(dateToSetTime.getTime());

  newDateToSetTime.setHours(hours, minutes, seconds, milliseconds);

  return newDateToSetTime;
}

export function getRandomColor() {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

export async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 100,
  isExponential = false,
): Promise<T> {
  try {
    const val = await fn();
    return val;
  } catch (error) {
    if (retriesLeft) {
      await new Promise((r) => setTimeout(r, interval));
      return retry(
        fn,
        retriesLeft - 1,
        isExponential ? interval * 2 : interval,
        isExponential,
      );
    } else
      throw new Error(
        `Max retries reached for function ${fn.name}, error: ${error}`,
      );
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function paginate<T>(
  array: T[],
  page_size: number,
  page_number: number,
): Paginate<T> {
  return {
    data: array.slice((page_number - 1) * page_size, page_number * page_size),
    count: array.length,
    limit: page_size,
    offset: page_number,
  };
}

/**
 * Generate a secure temporary password
 */
export function generateTemporaryPassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%';

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
