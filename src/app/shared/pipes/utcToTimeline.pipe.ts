import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, Interval } from 'luxon';

@Pipe({
  name: 'utcToTimeline',
  standalone: true
})
export class UtcToTimelinePipe implements PipeTransform {
  transform(utcDateString: string): string {
    // Parse UTC date string into local date using Luxon
    const localDate = DateTime.fromISO(utcDateString, { zone: 'utc' }).toLocal();
    
    // Convert to timeline
    const now = DateTime.now();
    const diff = Interval.fromDateTimes(localDate, now)
      .toDuration(['days', 'hours', 'minutes', 'seconds']);

    const seconds = Math.floor(diff.as('seconds'));
    const minutes = Math.floor(diff.as('minutes'));
    const hours = Math.floor(diff.as('hours'));
    const days = Math.floor(diff.as('days'));

    if (seconds < 60) return 'Just now';
    if (minutes == 1) return 'A minute ago';
    if (minutes > 1 && hours == 0) return `${minutes} minutes ago`;
    if (hours == 1) return 'An hour ago';
    if (hours > 1 && days == 0) return `${hours} hours ago`;
    if (days == 1) return 'Yesterday';
    if (days > 1 && days < 8) return `${days} days ago`;
    if (diff.as('days') >= 8) return localDate.toFormat('MMM dd, yyyy');

    return localDate.toFormat('MMM dd, yyyy HH:mm:ss');
  }
}