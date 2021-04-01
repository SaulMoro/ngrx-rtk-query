import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LazyRoutingModule } from './lazy-routing.module';
import { LazyComponent } from './lazy-counter/lazy.component';
import { CounterRowComponent } from './counter-row/counter-row.component';

@NgModule({
  declarations: [LazyComponent, CounterRowComponent],
  imports: [CommonModule, LazyRoutingModule, FormsModule, ReactiveFormsModule],
})
export class LazyModule {}
