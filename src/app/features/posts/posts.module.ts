import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { provideStoreApi } from 'ngrx-rtk-query';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostsListComponent } from './posts-list/posts-list.component';
import { PostsManagerComponent } from './posts-manager/posts-manager.component';
import { PostsRoutingModule } from './posts-routing.module';
import { postsApi } from './services';

@NgModule({
  declarations: [PostsManagerComponent, PostsListComponent, PostDetailComponent],
  imports: [CommonModule, PostsRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    // Lazy RTK Query
    provideStoreApi(postsApi),
  ],
})
export class PostsModule {}
