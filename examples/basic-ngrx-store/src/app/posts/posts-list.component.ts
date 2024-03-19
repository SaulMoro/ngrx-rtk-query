import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { useAddPostMutation, useGetPostsQuery } from './api';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mb-4">
      <input
        id="name"
        placeholder="New post name"
        type="text"
        [ngModel]="postNameControl()"
        (ngModelChange)="postNameControl.set($event)"
      />
      <button
        class="ml-4 select-none bg-black px-4 py-3 text-sm font-medium text-white transition duration-300 ease-in hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="!postNameControl() || addPost.isLoading()"
        (click)="addNewPost()"
      >
        {{ addPost.isLoading() ? 'Adding...' : 'Add Post' }}
      </button>
    </section>
    <section class="flex flex-col">
      <h1 class="mb-4 text-xl font-semibold">Posts List</h1>
      @if (postsQuery.isLoading()) {
        <small>Loading...</small>
      }
      @if (postsQuery.isError()) {
        <small>Error...</small>
      }
      @if (postsQuery.data(); as posts) {
        @for (post of posts; track post.id) {
          <li>
            <a class="hover:underline" [routerLink]="[post.id]">{{ post.name }}</a>
          </li>
        } @empty {
          <p class="mt-4">No posts :(</p>
        }
        @if (postsQuery.isFetching()) {
          <li>Refetching...</li>
        }
      }
    </section>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  readonly postsQuery = useGetPostsQuery();
  readonly addPost = useAddPostMutation();

  readonly postNameControl = signal('');

  addNewPost() {
    this.addPost({ name: this.postNameControl() })
      .unwrap()
      .then(() => {
        this.postNameControl.set('');
      });
  }
}
