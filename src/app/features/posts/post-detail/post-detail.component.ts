import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { useDeletePostMutation, useGetPostQuery, useUpdatePostMutation } from '@app/core/services';
import { pollingOptions } from '@app/features/counter/utils/polling-options';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-post-detail',
  template: `
    <div className="row" *ngIf="getPostQuery$ | async as getPostQuery">
      <div className="column">
        <h3>{{ getPostQuery?.data?.name }} {{ getPostQuery.isFetching ? '...refetching' : '' }}</h3>
      </div>
      <div *ngIf="deletePostMutation.state$ | async as deletePostState">
        <button
          class="btn-outline btn-primary"
          *ngIf="updatePostMutation.state$ | async as updatePostState"
          [disabled]="deletePostState?.isLoading || updatePostState?.isLoading"
        >
          {{ updatePostState?.isLoading ? 'Updating...' : 'Edit' }}
        </button>
        <button
          class="btn-outline btn-primary m-4"
          (click)="deletePost(getPostQuery?.data?.id)"
          [disabled]="deletePostState?.isLoading"
        >
          {{ deletePostState?.isLoading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
      <div className="row" style="background: '#eee'">
        <pre>{{ getPostQuery?.data | json }}</pre>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  //queries
  deletePostMutation = useDeletePostMutation();
  updatePostMutation = useUpdatePostMutation();
  getPostQuery$ = useGetPostQuery(this.route.params.pipe(map((params) => params.id)));

  // Polling
  pollingOptions = pollingOptions;
  pollingInterval = new BehaviorSubject<number>(this.pollingOptions[0].value);
  pollingInterval$ = this.pollingInterval.asObservable();

  constructor(private route: ActivatedRoute, private router: Router) {}

  deletePost(id: any): void {
    this.deletePostMutation
      .dispatch(id)
      .unwrap()
      .then(() => this.router.navigate(['/posts']));
  }
}
