import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsManagerComponent } from './posts-manager/posts-manager.component';
import { PostDetailComponent } from './post-detail/post-detail.component';

const routes: Routes = [
  { path: '', component: PostsManagerComponent },
  { path: ':id', component: PostDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostsRoutingModule {}
