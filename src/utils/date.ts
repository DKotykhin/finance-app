import { getLocalTimeZone, parseDate } from '@internationalized/date';
import { DateValue } from '@react-types/datepicker';
import { format } from 'date-fns';

export const valueToDate = (value: DateValue): Date => {
  return value?.toDate(getLocalTimeZone());
};

export const dateToValue = (date: Date): DateValue => {
  return parseDate(format(date, 'yyyy-MM-dd'));
};
