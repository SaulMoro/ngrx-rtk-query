import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  template: `
    <ng-container *ngIf="currentPage && pages && pages > 1">
      <div class="flex text-gray-700">
        <button
          class="mr-1 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200"
          queryParamsHandling="merge"
          [ngClass]="currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-300'"
          [disabled]="currentPage === 1"
          [routerLink]="['./']"
          [queryParams]="{ page: currentPage - 1 }"
          (click)="onPageSelect(currentPage - 1)"
        >
          <svg
            class="w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="flex h-12 rounded-full bg-gray-200 font-medium">
          <a
            *ngIf="currentPage > 2"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: 1 }"
            (click)="onPageSelect(1)"
          >
            1
          </a>
          <a
            *ngIf="currentPage > 3"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: 2 }"
            (click)="onPageSelect(2)"
          >
            2
          </a>
          <span
            *ngIf="currentPage > 4"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in md:flex"
          >
            ...
          </span>

          <a
            *ngIf="currentPage - 1 >= 1"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage - 1 }"
            (click)="onPageSelect(currentPage - 1)"
          >
            {{ currentPage - 1 }}
          </a>
          <a
            class="hidden w-12 items-center justify-center rounded-full bg-indigo-500 leading-5 transition duration-200 ease-in md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage }"
          >
            {{ currentPage }}
          </a>
          <a
            *ngIf="currentPage < pages"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage + 1 }"
            (click)="onPageSelect(currentPage + 1)"
          >
            {{ currentPage + 1 }}
          </a>

          <span
            *ngIf="currentPage + 3 < pages"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in md:flex"
          >
            ...
          </span>
          <a
            *ngIf="currentPage + 2 < pages"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: pages - 1 }"
            (click)="onPageSelect(pages - 1)"
          >
            {{ pages - 1 }}
          </a>
          <a
            *ngIf="currentPage + 1 < pages"
            class="hidden w-12 items-center justify-center rounded-full leading-5 transition duration-200 ease-in hover:bg-indigo-300 md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: pages }"
            (click)="onPageSelect(pages)"
          >
            {{ pages }}
          </a>
        </div>
        <button
          class="ml-1 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200"
          queryParamsHandling="merge"
          [ngClass]="currentPage === +pages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-300'"
          [disabled]="currentPage === +pages"
          [routerLink]="['./']"
          [queryParams]="{ page: currentPage + 1 }"
          (click)="onPageSelect(currentPage + 1)"
        >
          <svg
            class="w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  @Input() currentPage? = 0;
  @Input() pages? = 0;
  @Output() page = new EventEmitter<number>();

  constructor() {}

  onPageSelect(page: number): void {
    this.page.emit(page);
  }

  trackByFn(index: number): number {
    return index;
  }
}
