import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Post, useGetPostsQuery } from '@app/core/services/posts';

@Component({
  selector: 'app-posts-list',
  template: `
    <section class="space-y-4" *ngIf="postsQuery$ | async as postsQuery">
      <small *ngIf="postsQuery.isLoading">Loading...</small>

      <div *ngIf="postsQuery?.data?.length; else noPosts">
        <li *ngFor="let post of postsQuery?.data; trackBy: trackByFn">
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
  postsQuery$ = useGetPostsQuery();

  constructor() {}

  trackByFn(_index: number, post: Post): number {
    return post.id;
  }
}
