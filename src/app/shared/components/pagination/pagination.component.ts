import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PagingModel } from '@svp-models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  imports: [NgSelectModule, FormsModule, CommonModule],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input({ required: true }) paging!: PagingModel | undefined;
  @Input() itemsPerPageOptions: number[] = [10, 25, 50, 100];
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  itemsPerPage = this.itemsPerPageOptions[0];

  ngOnInit(): void {
    return;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemsPerPageOptions']) {
      this.itemsPerPage = this.itemsPerPageOptions[0];
    }
  }

  get pagesDisplay(): number[] {
    if (!this.paging) return [1];

    const allPages = Array.from({ length: this.paging.totalPages }, (_, i) => i + 1);

    // using the current page, get the pages to display
    if (this.paging.totalPages <= 5) {
      return allPages;
    }

    const currentPage = this.paging.pageIndex;
    const pages = [];
    let start = currentPage - 2;
    let end = currentPage + 2;

    if (currentPage <= 3) {
      start = 1;
      end = 5;
    }

    if (currentPage >= this.paging.totalPages - 2) {
      start = this.paging.totalPages - 4;
      end = this.paging.totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showingText(): string {
    if (!this.paging) return '0-0 of 0';

    const start = (this.paging.pageIndex - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.paging.totalItems, this.paging.pageIndex * this.itemsPerPage);

    return `${start}-${end} of ${this.paging.totalItems}`;
  }

  goToNextPage(): void {
    if (!this.paging) return;

    if (this.paging.hasNextPage) {
      this.paging.pageIndex++;
      this.pageChange.emit(this.paging.pageIndex);
    }
  }

  goToPreviousPage(): void {
    if (!this.paging) return;

    if (this.paging.hasPreviousPage) {
      this.paging.pageIndex--;
      this.pageChange.emit(this.paging.pageIndex);
    }
  }

  goToFirstPage(): void {
    if (!this.paging) return;

    this.paging.pageIndex = 1;
    this.pageChange.emit(1);
  }

  goToLastPage(): void {
    if (!this.paging) return;

    this.paging.pageIndex = this.paging.totalPages;
    this.pageChange.emit(this.paging.totalPages);
  }

  setPage(page: number): void {
    if (!this.paging) return;

    this.paging.pageIndex = page;
    this.pageChange.emit(page);
  }

  setItemsPerPage() {
    this.itemsPerPageChange.emit(this.itemsPerPage);
  }
}
