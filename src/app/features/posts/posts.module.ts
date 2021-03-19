import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PostsRoutingModule } from './posts-routing.module';
import { PostsQueryModule } from './services';
import { PostsManagerComponent } from './posts-manager/posts-manager.component';
import { PostsListComponent } from './posts-list/posts-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';

@NgModule({
  declarations: [PostsManagerComponent, PostsListComponent, PostDetailComponent],
  imports: [
    CommonModule,
    PostsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // Lazy RTK Query
    PostsQueryModule,
  ],
})
export class PostsModule {}
