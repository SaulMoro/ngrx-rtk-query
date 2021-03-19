import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { useAddPostMutation } from '../services';

@Component({
  selector: 'app-posts-manager',
  template: `
    <section class="space-y-4">
      <div>
        <input id="name" placeholder="New post name" type="text" [formControl]="postNameFormControl" />
        <button
          *ngIf="addPost.state$ | async as addPostState"
          class="m-4 btn btn-primary"
          [disabled]="postNameFormControl.invalid || addPostState.isLoading"
          (click)="addNewPost()"
        >
          {{ addPostState.isLoading ? 'Adding...' : 'Add Post' }}
        </button>
      </div>

      <h1 class="text-xl font-semibold">Posts List</h1>
      <app-posts-list></app-posts-list>
      <hr />
      <h1 class="text-xl font-semibold">Posts List with duplicate subscription</h1>
      <app-posts-list></app-posts-list>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsManagerComponent {
  addPost = useAddPostMutation();
  postNameFormControl = new FormControl('', [Validators.required]);

  constructor() {}

  addNewPost(): void {
    this.addPost.dispatch({ name: this.postNameFormControl.value });
  }
}
