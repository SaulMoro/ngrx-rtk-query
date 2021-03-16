import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Post, useGetPostsQuery } from '@app/core/services/posts';

@Component({
  selector: 'app-post-manager',
  template: `
    <section class="space-y-4">
      <h1 class="text-xl font-semibold">Posts List</h1>

      <div *ngIf="postsQuery$ | async as postsQuery">
        <li *ngFor="let post of postsQuery?.data; trackBy: trackByFn">
          <a [routerLink]="['/posts', post.id]">{{ post.name }}</a>
        </li>
      </div>
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
