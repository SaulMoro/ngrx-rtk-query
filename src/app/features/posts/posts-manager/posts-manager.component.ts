import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-posts-manager',
  template: `
    <section class="space-y-8">
      <app-new-post></app-new-post>

      <h1 class="text-xl font-semibold">Posts List</h1>
      <app-posts-list></app-posts-list>

      <hr />

      <h1 class="text-xl font-semibold">Posts List with duplicate subscription</h1>
      <app-posts-list></app-posts-list>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsManagerComponent {
  constructor() {}
}
