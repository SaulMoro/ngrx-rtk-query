import { type Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./posts/posts-list/posts-list.component').then((c) => c.PostsListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./posts/post-details/post-details.component').then((c) => c.PostDetailsComponent),
  },
];
