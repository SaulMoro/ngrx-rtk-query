import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PostsRoutingModule } from './posts-routing.module';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostsListComponent } from './posts-list/posts-list.component';

@NgModule({
  declarations: [PostsListComponent, PostDetailComponent],
  imports: [CommonModule, PostsRoutingModule, FormsModule],
})
export class PostsModule {}
