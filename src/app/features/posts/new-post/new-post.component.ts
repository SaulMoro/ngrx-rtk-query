import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { useAddPostMutation } from '../services';

@Component({
  selector: 'app-new-post',
  template: `
    <input placeholder="New post name" type="text" [formControl]="postFormControl" />
    <button
      *ngIf="addPostMutation.state$ | async as addPostState"
      class="m-4 btn btn-primary"
      (click)="handleAddPost()"
      [disabled]="addPostState.isLoading"
    >
      {{ addPostState.isLoading ? 'Adding...' : 'Add Post' }}
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPostComponent {
  postFormControl = new FormControl('');

  addPostMutation = useAddPostMutation();

  constructor() {}

  handleAddPost(): void {
    this.addPostMutation.dispatch({ name: this.postFormControl.value });
  }
}
