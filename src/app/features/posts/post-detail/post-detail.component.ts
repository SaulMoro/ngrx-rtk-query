import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { useDeletePostMutation, useGetPostQuery, useUpdatePostMutation } from '@app/core/services';

@Component({
  selector: 'app-post-detail',
  template: `
    <section *ngIf="postQuery$ | async as postQuery">
      <h1 class="text-xl font-semibold">
        {{ postQuery?.data?.name }} {{ postQuery.isFetching ? '...refetching' : '' }}
      </h1>

      <ng-container *ngIf="deletePostMutation.state$ | async as deletePostState">
        <button
          class="btn-outline btn-primary"
          *ngIf="updatePostMutation.state$ | async as updatePostState"
          [disabled]="deletePostState.isLoading || updatePostState?.isLoading"
        >
          {{ updatePostState?.isLoading ? 'Updating...' : 'Edit' }}
        </button>
        <button
          class="m-4 btn-outline btn-primary"
          (click)="deletePost(postQuery.data?.id)"
          [disabled]="deletePostState?.isLoading"
        >
          {{ deletePostState?.isLoading ? 'Deleting...' : 'Delete' }}
        </button>
      </ng-container>

      <pre class="bg-gray-200">{{ postQuery.data | json }}</pre>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  postQuery$ = useGetPostQuery(this.route.params.pipe(map((params) => +params.id)));
  deletePostMutation = useDeletePostMutation();
  updatePostMutation = useUpdatePostMutation();

  constructor(private route: ActivatedRoute, private router: Router) {}

  deletePost(id: number = 0): void {
    this.deletePostMutation
      .dispatch(id)
      .unwrap()
      .then(() => this.router.navigate(['/posts']));
  }
}
