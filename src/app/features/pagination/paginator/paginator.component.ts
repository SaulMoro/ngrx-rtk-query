import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  template: `
    <ng-container *ngIf="currentPage && pages && pages > 1">
      <div class="flex text-gray-700">
        <button
          class="flex items-center justify-center w-12 h-12 mr-1 transition-colors duration-200 bg-gray-200 rounded-full"
          queryParamsHandling="merge"
          [ngClass]="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
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
        <div class="flex h-12 font-medium bg-gray-200 rounded-full">
          <a
            *ngIf="currentPage > 2"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: 1 }"
            (click)="onPageSelect(1)"
          >
            1
          </a>
          <a
            *ngIf="currentPage > 3"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: 2 }"
            (click)="onPageSelect(2)"
          >
            2
          </a>
          <span
            *ngIf="currentPage > 4"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex"
          >
            ...
          </span>

          <a
            *ngIf="currentPage - 1 >= 1"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage - 1 }"
            (click)="onPageSelect(currentPage - 1)"
          >
            {{ currentPage - 1 }}
          </a>
          <a
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in bg-indigo-500 rounded-full md:flex"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage }"
          >
            {{ currentPage }}
          </a>
          <a
            *ngIf="currentPage < pages"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: currentPage + 1 }"
            (click)="onPageSelect(currentPage + 1)"
          >
            {{ currentPage + 1 }}
          </a>

          <span
            *ngIf="currentPage + 3 < pages"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex"
          >
            ...
          </span>
          <a
            *ngIf="currentPage + 2 < pages"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: pages - 1 }"
            (click)="onPageSelect(pages - 1)"
          >
            {{ pages - 1 }}
          </a>
          <a
            *ngIf="currentPage + 1 < pages"
            class="items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300"
            queryParamsHandling="merge"
            [routerLink]="['./']"
            [queryParams]="{ page: pages }"
            (click)="onPageSelect(pages)"
          >
            {{ pages }}
          </a>
        </div>
        <button
          class="flex items-center justify-center w-12 h-12 ml-1 transition-colors duration-200 bg-gray-200 rounded-full"
          queryParamsHandling="merge"
          [ngClass]="currentPage === +pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
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
