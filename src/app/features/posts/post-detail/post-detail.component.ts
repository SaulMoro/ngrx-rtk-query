import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Post, useDeletePostMutation, useGetPostQuery, useUpdatePostMutation } from '@app/core/services';

@Component({
  selector: 'app-post-detail',
  template: `
    <section class="space-y-4" *ngIf="postQuery$ | async as postQuery">
      <div>
        <h1 class="text-xl font-semibold">{{ postQuery?.data?.name }}</h1>
        <small *ngIf="postQuery.isFetching">Refetching...</small>
      </div>

      <div class="flex items-center space-x-4" *ngIf="deletePostMutation.state$ | async as deletePostState">
        <button
          class="btn-outline btn-primary"
          *ngIf="updatePostMutation.state$ | async as updatePostState"
          [disabled]="postQuery.isLoading || deletePostState.isLoading || updatePostState.isLoading"
        >
          {{ updatePostState?.isLoading ? 'Updating...' : 'Edit' }}
        </button>
        <button
          class="m-4 btn-outline btn-primary"
          (click)="deletePost(postQuery.data?.id)"
          [disabled]="postQuery.isLoading || deletePostState.isLoading"
        >
          {{ deletePostState?.isLoading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>

      <pre class="bg-gray-200">{{ postQuery.data | json }}</pre>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  postQuery$ = useGetPostQuery(this.route.params.pipe(map((params) => +params.id)));
  updatePostMutation = useUpdatePostMutation();
  deletePostMutation = useDeletePostMutation();

  constructor(private route: ActivatedRoute, private router: Router) {}

  updatePost(post: Post): void {
    // TODO:
  }

  deletePost(id: number = 0): void {
    this.deletePostMutation.dispatch(id);
    this.router.navigate(['/posts']);
  }
}
