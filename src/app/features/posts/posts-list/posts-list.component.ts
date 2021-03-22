import { Component, ChangeDetectionStrategy } from '@angular/core';
import { useGetPostsQuery } from '../services';
import { Post } from '../models';

@Component({
  selector: 'app-posts-list',
  template: `
    <section *ngIf="postsQuery$ | async as postsQuery" class="space-y-4">
      <ng-container *ngIf="postsQuery.data as posts; else loading">
        <div *ngIf="posts.length; else emptyPosts">
          <li *ngFor="let post of posts; trackBy: trackByFn">
            <a class="hover:underline" [routerLink]="['/posts', post.id]">{{ post.name }}</a>
          </li>
        </div>
        <ng-template #emptyPosts>
          <p class="mt-4">No posts :(</p>
        </ng-template>
      </ng-container>

      <ng-template #loading>
        <small>Loading...</small>
      </ng-template>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  postsQuery$ = useGetPostsQuery();

  constructor() {}

  trackByFn(_index: number, post: Post): number {
    return post.id;
  }
}
