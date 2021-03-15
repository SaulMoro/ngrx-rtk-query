import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty',
  template: ` <p>No queries here!</p> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyComponent {
  constructor() {}
}
