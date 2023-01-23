import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { useAddPostMutation } from '../services';

@Component({
  selector: 'app-posts-manager',
  template: `
    <section class="space-y-4">
      <div>
        <input id="name" placeholder="New post name" type="text" [formControl]="postNameFormControl" />
        <button
          *ngIf="addPost.state$ | async as addPostState"
          class="btn btn-primary m-4"
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
  postNameFormControl = new UntypedFormControl('', [Validators.required]);

  constructor() {}

  addNewPost(): void {
    this.addPost
      .dispatch({ name: this.postNameFormControl.value })
      .unwrap()
      .then(() => this.postNameFormControl.setValue(''));
  }
}
