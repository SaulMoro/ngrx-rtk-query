import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { api, defaultApi, libPostsApi, Post } from '../helper-apis';

@Component({
  selector: 'lib-test-query',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <button type="button" (click)="increment()">Increment value</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FetchingComponent {
  value = new BehaviorSubject<number>(0);
  value$ = this.value.asObservable();

  query$ = api.endpoints.getUser.useQuery(1, this.value$.pipe(map((value) => ({ skip: value < 1 }))));

  increment(): void {
    // eslint-disable-next-line rxjs/no-subject-value
    this.value.next(this.value.getValue() + 1);
  }
}

@Component({
  selector: 'lib-test-query',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isLoading">{{ '' + query.isLoading }}</div>
      <button type="button" (click)="increment()">Increment value</button>
      <button type="button" (click)="query.refetch()">Refetch</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  value = new BehaviorSubject<number>(0);
  value$ = this.value.asObservable();

  query$ = api.endpoints.getUser.useQuery(2, this.value$.pipe(map((value) => ({ skip: value < 1 }))));

  increment(): void {
    // eslint-disable-next-line rxjs/no-subject-value
    this.value.next(this.value.getValue() + 1);
  }
}

@Component({
  selector: 'lib-test-query',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <div data-testid="isLoading">{{ '' + query.isLoading }}</div>
      <button type="button" (click)="increment()">Increment value</button>
      <button type="button" (click)="query.refetch()">Refetch</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FetchingLoadingComponent {
  value = new BehaviorSubject<number>(0);
  value$ = this.value.asObservable();

  query$ = api.endpoints.getUser.useQuery(22, this.value$.pipe(map((value) => ({ skip: value < 1 }))));

  increment(): void {
    // eslint-disable-next-line rxjs/no-subject-value
    this.value.next(this.value.getValue() + 1);
  }
}

@Component({
  selector: 'lib-test-query',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isLoading">{{ '' + query.isLoading }}</div>
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <div data-testid="amount">{{ '' + query.data?.amount }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefetchOnMountComponent {
  query$ = api.endpoints.getIncrementedAmount.useQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
}

@Component({
  selector: 'lib-test-query',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isLoading">{{ '' + query.isLoading }}</div>
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <div data-testid="amount">{{ '' + query.data?.amount }}</div>
      <button (click)="toggleSkip()">change skip</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefetchOnMountSkipComponent {
  skip = new BehaviorSubject<boolean>(true);
  skip$ = this.skip.asObservable();

  query$ = api.endpoints.getIncrementedAmount.useQuery(
    undefined,
    this.skip$.pipe(map((skip) => ({ refetchOnMountOrArgChange: 0.5, skip }))),
  );

  toggleSkip(): void {
    // eslint-disable-next-line rxjs/no-subject-value
    this.skip.next(!this.skip.getValue());
  }
}

@Component({
  selector: 'lib-test-mutation',
  template: `
    <div *ngIf="updateUserMutation.state$ | async as updateUser">
      <div data-testid="isLoading">{{ '' + updateUser.isLoading }}</div>
      <div data-testid="result">{{ stringify(updateUser.data) }}</div>
      <button (click)="updateUserMutation.dispatch({ name: 'Banana' })">Update User</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MutationComponent {
  updateUserMutation = api.endpoints.updateUser.useMutation();

  // no pipes here
  stringify(data: any): string {
    return JSON.stringify(data);
  }
}

export const HIGH_PRIORITY_USER_ID = 4;
@Component({
  selector: 'lib-test-prefetch',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <button data-testid="highPriority" (mouseenter)="prefetchUser()">High priority action intent</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrefetchHighPriorityComponent {
  query$ = api.endpoints.getUser.useQuery(HIGH_PRIORITY_USER_ID);

  prefetchUser(): void {
    api.usePrefetch('getUser', { force: true })(HIGH_PRIORITY_USER_ID, { force: true });
  }
}

export const LOW_PRIORITY_USER_ID = 2;
@Component({
  selector: 'lib-test-prefetch',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <button data-testid="lowPriority" (mouseenter)="prefetchUser()">Low priority user action intent</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrefetchLowPriorityComponent {
  query$ = api.endpoints.getUser.useQuery(LOW_PRIORITY_USER_ID);

  prefetchUser(): void {
    api.usePrefetch('getUser', { force: false })(LOW_PRIORITY_USER_ID);
  }
}

@Component({
  selector: 'lib-test-prefetch',
  template: `
    <div>
      <button data-testid="lowPriority" (mouseenter)="prefetchUser()">Low priority user action intent</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrefetchUncachedComponent {
  prefetchUser(): void {
    api.usePrefetch('getUser', { ifOlderThan: 10 })(LOW_PRIORITY_USER_ID);
  }
}

@Component({
  selector: 'lib-test-query-defaults',
  template: `
    <div *ngIf="query$ | async as query">
      <div data-testid="isLoading">{{ '' + query.isLoading }}</div>
      <div data-testid="isFetching">{{ '' + query.isFetching }}</div>
      <div data-testid="amount">{{ '' + query.data?.amount }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefetchOnMountDefaultsComponent {
  query$ = defaultApi.endpoints.getIncrementedAmount.useQuery();
}

@Component({
  selector: 'lib-test-post',
  template: `
    <div *ngIf="postsQuery$ | async as postsQuery">
      <button data-testid="addPost" (click)="addPost(postsQuery.data)">Add random post</button>
      <button data-testid="updatePost" (click)="updatePost()">Update post</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComponent {
  postsQuery$ = libPostsApi.useGetPostsQuery();
  addPostMutation = libPostsApi.useAddPostMutation();
  updatePostMutation = libPostsApi.useUpdatePostMutation();

  addPost(posts: Post[] | undefined): void {
    this.addPostMutation.dispatch({ name: `some text ${posts?.length}`, fetched_at: new Date().toISOString() });
  }

  updatePost(): void {
    this.updatePostMutation.dispatch({ id: 1, name: 'supercoooll!' });
  }
}

@Component({
  selector: 'lib-test-selected-post',
  template: `
    <div *ngIf="postQuery$ | async as postQuery">
      <div data-testid="renderCount">{{ '' + renderCount }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedPostComponent {
  /**
   * Notes on the renderCount behavior
   *
   * We initialize at 0, and the first render will bump that 1 while post is `undefined`.
   * Once the request resolves, it will be at 2. What we're looking for is to make sure that
   * any requests that don't directly change the value of the selected item will have no impact
   * on rendering.
   */
  renderCount = 0;

  postQuery$ = libPostsApi.endpoints.getPosts
    .useQueryState(undefined, {
      selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === 1) }),
    })
    .pipe(tap(() => (this.renderCount = this.renderCount + 1)));
}
@Component({
  selector: 'lib-test-selected-post-hook',
  template: `
    <div *ngIf="postQuery$ | async as postQuery">
      <div data-testid="postName">{{ postQuery.post?.name }}</div>
      <div data-testid="renderCount">{{ '' + renderCount }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedPostHookComponent {
  renderCount = 0;

  postQuery$ = libPostsApi
    .useGetPostsQuery(undefined, {
      selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === 1) }),
    })
    .pipe(tap(() => (this.renderCount = this.renderCount + 1)));
}

@Component({
  selector: 'lib-test-posts-container',
  template: `
    <div>
      <lib-test-post></lib-test-post>
      <lib-test-selected-post></lib-test-selected-post>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsContainerComponent {}
@Component({
  selector: 'lib-test-posts-container-hook',
  template: `
    <div>
      <lib-test-post></lib-test-post>
      <lib-test-selected-post-hook></lib-test-selected-post-hook>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsHookContainerComponent {}
@NgModule({
  declarations: [
    PostsContainerComponent,
    PostsHookContainerComponent,
    PostComponent,
    SelectedPostComponent,
    SelectedPostHookComponent,
  ],
  imports: [CommonModule],
})
export class PostLibTestModule {}
