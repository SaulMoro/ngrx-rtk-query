import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { useDeletePostMutation, useGetPostQuery, useUpdatePostMutation } from '../api';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [FormsModule, JsonPipe],
  template: `
    <h1 class="text-xl font-semibold">{{ postQuery.data()?.name }}</h1>
    @if (!isEditing()) {
      <div class="mt-4 flex items-center space-x-4">
        <button
          class="select-none border border-black bg-transparent px-4 py-3 text-sm font-medium text-black transition duration-300 ease-in hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="postQuery.isLoading() || deletePostMutation.isLoading() || updatePostMutation.isLoading()"
          (click)="toggleEdit()"
        >
          {{ updatePostMutation.isLoading() ? 'Updating...' : 'Edit' }}
        </button>
        <button
          class="select-none border border-black bg-transparent px-4 py-3 text-sm font-medium text-black transition duration-300 ease-in hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="postQuery.isLoading() || deletePostMutation.isLoading()"
          (click)="deletePost()"
        >
          {{ deletePostMutation.isLoading() ? 'Deleting...' : 'Delete' }}
        </button>
        <button
          class="select-none border border-black bg-transparent px-4 py-3 text-sm font-medium text-black transition duration-300 ease-in hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="postQuery.isFetching()"
          (click)="postQuery.refetch()"
        >
          {{ postQuery.isFetching() ? 'Fetching...' : 'Refresh' }}
        </button>
      </div>
    } @else {
      <div class="mt-4 space-x-4">
        <input type="text" [ngModel]="postNameControl()" (ngModelChange)="postNameControl.set($event)" />
        <button
          class="select-none bg-black px-4 py-3 text-sm font-medium text-white transition duration-300 ease-in hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="updatePostMutation.isLoading()"
          (click)="updatePost()"
        >
          {{ updatePostMutation.isLoading() ? 'Updating...' : 'Update' }}
        </button>
        <button
          class="select-none bg-black px-4 py-3 text-sm font-medium text-white transition duration-300 ease-in hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="updatePostMutation.isLoading()"
          (click)="toggleEdit()"
        >
          Cancel
        </button>
      </div>
    }

    @if (postQuery.isFetching()) {
      <p class="mt-4">Loading...</p>
    }
    <pre class="mt-4 bg-gray-200">{{ postQuery.data() | json }}</pre>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailsComponent {
  readonly id = input.required({ transform: numberAttribute });

  readonly postQuery = useGetPostQuery(() => this.id(), {
    pollingInterval: 5000,
  });

  readonly updatePostMutation = useUpdatePostMutation();
  readonly deletePostMutation = useDeletePostMutation();

  readonly #router = inject(Router);
  readonly postNameControl = signal('');
  readonly isEditing = signal(false);

  #_ = effect(() => {
    const data = this.postQuery.data();
    untracked(() => this.postNameControl.set(data?.name ?? ''));
  });

  updatePost(): void {
    this.updatePostMutation({ id: this.id(), name: this.postNameControl() })
      .unwrap()
      .then(() => this.toggleEdit());
  }

  deletePost(): void {
    this.deletePostMutation(this.id())
      .unwrap()
      .then(() => this.#router.navigate(['/']))
      .catch(() => console.error('Error deleting Post'));
  }

  toggleEdit(): void {
    this.isEditing.update((isEditing) => !isEditing);
  }
}
