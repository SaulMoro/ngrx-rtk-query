import { Component, ChangeDetectionStrategy } from '@angular/core';

import { FormControl } from '@angular/forms';
import { useAddPostMutation } from '@app/core/services';

@Component({
  selector: 'app-new-post',
  template: `
    <div class="row" *ngIf="addPostMutation.state$ | async as addPostState">
      <div class="column column-3">
        <input placeholder="New post name" type="text" [formControl]="postFormControl" />
        <button class="btn-outline btn-primary m-4" (click)="handleAddPost()" [disabled]="addPostState.isLoading">
          {{ addPostState.isLoading ? 'Adding...' : 'Add Post' }}
        </button>
      </div>
    </div>
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
