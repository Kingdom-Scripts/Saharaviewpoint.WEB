import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcToTimeline',
  standalone: true
})
export class UtcToTimelinePipe implements PipeTransform {
  transform(utcDate: Date): string {
    // TODO: Implement the conversion of the Date to the local timezone

    const localDate = utcDate;

    // convert to timeline
    const now = new Date();
    const diff = now.getTime() - localDate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes == 1) return 'A minute ago';
    if (minutes > 1 && hours == 0) return `${minutes} minutes ago`;
    if (hours == 1) return 'An hour ago';
    if (hours > 1 && days == 0) return `${hours} hours ago`;
    if (days == 1) return 'Yesterday';
    if (days > 1) return `${days} days ago`;

    // default return
    return new Date(localDate).toLocaleString();
  }
}