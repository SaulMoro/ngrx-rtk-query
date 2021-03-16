import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'counter',
    pathMatch: 'full',
  },
  { path: 'counter', loadChildren: () => import('./features/counter/counter.module').then((m) => m.CounterModule) },
  { path: 'posts', loadChildren: () => import('./features/posts/posts.module').then((m) => m.PostsModule) },
  { path: 'empty', loadChildren: () => import('./features/empty/empty.module').then((m) => m.EmptyModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
