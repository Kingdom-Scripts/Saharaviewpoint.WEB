import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'utcToLocalDate',
  standalone: true
})
export class UtcToLocalDatePipe implements PipeTransform {
  transform(utcDate: string, format: string = 'MMM dd, yyyy'): string {
    // Parse UTC date string into local date using Luxon
    const localDate = DateTime.fromISO(utcDate, { zone: 'utc' }).toLocal();

    // Return formatted local date
    return localDate.toFormat(format);
  }
}