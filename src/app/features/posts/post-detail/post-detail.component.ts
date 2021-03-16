import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { useDeletePostMutation, useGetPostQuery, useUpdatePostMutation } from '@app/core/services';

@Component({
  selector: 'app-post-detail',
  template: `
    <div className="row" *ngIf="postQuery$ | async as postQuery">
      <div className="column">
        <h3>{{ postQuery?.data?.name }} {{ postQuery.isFetching ? '...refetching' : '' }}</h3>
      </div>
      <div *ngIf="deletePostMutation.state$ | async as deletePostState">
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
      </div>
      <div className="row" style="background: '#eee'">
        <pre>{{ postQuery.data | json }}</pre>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  //queries
  postQuery$ = useGetPostQuery(this.route.params.pipe(map((params): number => +params.id)));
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
