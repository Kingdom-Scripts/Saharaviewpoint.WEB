import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcToLocalDate',
  standalone: true
})
export class UtcToLocalDatePipe implements PipeTransform {
  transform(utcDate: Date): string {
    var browserLanguage = navigator.language;

    let date = new Date(utcDate).toLocaleDateString(browserLanguage);

    console.log('===========================')
    console.log('browserLanguage', browserLanguage)
    console.log('utcDate', utcDate);
    console.log('date', date);
    console.log('===========================')
    
    // convert date to 'MMM dd, yyyy'
    return date;
  }
}