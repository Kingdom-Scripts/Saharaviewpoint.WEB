import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, booleanAttribute } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'svp-search-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex">
        <div class="relative">
          <input type="search" placeholder="{{svpPlaceholder}}" class="block {{widthClass}} z-20 text-sm rounded-e-lg" [(ngModel)]="searchTerm" (change)="handleOnChange()" (blur)="handleOnBlur()" (keyup)="handleOnKeyUp($event)">
          
          @if(displaySearchButton) {
            <button type="submit" class="absolute top-0 end-0 h-full p-2 text-sm font-medium text-white bg-primary-700 rounded-e-lg border border-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-transparent dark:bg-night-500 dark:border-night-500 dark:hover:bg-night-500" (click)="handleOnSearch()">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" class="w-4 h-4"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"></path>
              </svg>
              <span class="sr-only">Search</span>
            </button>
          }
        </div>
      </div>
  `
})
export class SvpSearchButtonComponent {
  @Input() svpPlaceholder: string = 'Search';
  @Input() widthClass: string = 'w-64';
  @Input() minLetters: number = 3;
  @Input({transform: booleanAttribute}) displaySearchButton: boolean = true;

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onBlur: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();

  searchTerm: string = '';

  handleOnChange(): void {
    if (this.searchTerm.length < 1) return;
    this.onChange.emit(this.searchTerm);
  }

  handleOnBlur(): void {
    if (this.searchTerm.length < 1) return;
    this.onBlur.emit(this.searchTerm);
  }

  handleOnSearch(): void {
    if (this.searchTerm.length < 1) return;
    this.onSearch.emit(this.searchTerm);
  }

  handleOnKeyUp(e: KeyboardEvent): void {
    // if the Enter key is pressed, emit the search event
    if (e.key === 'Enter') {
      this.onSearch.emit(this.searchTerm);
    }

    // if the search term is less than the minimum letters, don't emit the search event
    if (this.searchTerm.length != 0 && this.searchTerm.length < this.minLetters) 
      return;

    this.onSearch.emit(this.searchTerm);
  }
}