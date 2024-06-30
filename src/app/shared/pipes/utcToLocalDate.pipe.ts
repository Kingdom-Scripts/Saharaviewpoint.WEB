import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

type WithTime = 'withTime';

@Pipe({
  name: 'utcToLocalDate',
  standalone: true,
})
export class UtcToLocalDatePipe implements PipeTransform {
  // Overloads for string type
  transform(utcDate: string): string;
  transform(utcDate: string, format: string): string;
  transform(utcDate: string, withTime: WithTime): string;
  transform(utcDate: string, format: string, withTime: WithTime): string;
  // Overloads for Date type
  transform(utcDate: Date): string;
  transform(utcDate: Date, format: string): string;
  transform(utcDate: Date, withTime: WithTime): string;
  transform(utcDate: Date, format: string, withTime: WithTime): string;
  // Unified implementation
  transform(utcDate: string | Date, formatOrWithTime?: string | WithTime, withTime?: WithTime): string {
    // return empty string if utcDate is null or undefined
    if (!utcDate) {
      return '';
    }
    
    let format = 'MMM dd, yyyy';
    let includeTime = false;
    let localDate: DateTime;

    if (typeof formatOrWithTime === 'string' && formatOrWithTime !== 'withTime') {
      format = formatOrWithTime;
      includeTime = withTime === 'withTime';
    } else if (formatOrWithTime === 'withTime') {
      includeTime = true;
    }

    if (utcDate instanceof Date) {
      // Convert Date object to Luxon DateTime
      localDate = DateTime.fromJSDate(utcDate).toLocal();
    } else {
      // Parse UTC date string into local date using Luxon
      localDate = DateTime.fromISO(utcDate, { zone: 'utc' }).toLocal();
    }

    // Adjust format if withTime is true
    const adjustedFormat = includeTime ? 'MMM dd, yyyy. hh:mm a' : format;

    // Return formatted local date
    return localDate.toFormat(adjustedFormat);
  }
}