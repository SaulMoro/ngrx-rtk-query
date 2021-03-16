import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { useGetPostsQuery } from '@app/core/services/posts';

@Component({
  selector: 'app-post-manager',
  template: `
    <div *ngIf="getPostsQuery$ | async as getPostsState">
      <li *ngFor="let post of getPostsState?.data">
        <a [routerLink]="['/posts', post.id]">
          {{ post.name }}
        </a>
      </li>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostManagerComponent {
  getPostsQuery$ = useGetPostsQuery();

  constructor(private router: Router) {}

  onSelect(id: number): void {
    this.router.navigate(['posts', id]);
  }
}
