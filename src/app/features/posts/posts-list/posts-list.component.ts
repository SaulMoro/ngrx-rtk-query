import { Component, ChangeDetectionStrategy } from '@angular/core';
import { useGetPostsQuery } from '../services';
import { Post } from '../models';

@Component({
  selector: 'app-posts-list',
  template: `
    <section class="space-y-4" *ngIf="postsQuery$ | async as postsQuery">
      <small *ngIf="postsQuery.isLoading">Loading...</small>

      <div *ngIf="postsQuery.posts?.length; else noPosts">
        <li *ngFor="let post of postsQuery.posts; trackBy: trackByFn">
          <a class="hover:underline" [routerLink]="['/posts', post.id]">{{ post.name }}</a>
        </li>
      </div>

      <ng-template #noPosts>
        <p class="mt-4">No posts :(</p>
      </ng-template>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  postsQuery$ = useGetPostsQuery(undefined, {
    selectFromResult: ({ data: posts, isLoading }) => ({ posts, isLoading }),
  });

  constructor() {}

  trackByFn(_index: number, post: Post): number {
    return post.id;
  }
}
