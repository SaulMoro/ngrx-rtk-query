import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CounterRoutingModule } from './counter-routing.module';
import { CounterManagerComponent } from './counter-manager/counter-manager.component';
import { CounterComponent } from './counter/counter.component';

@NgModule({
  declarations: [CounterManagerComponent, CounterComponent],
  imports: [CommonModule, CounterRoutingModule, FormsModule],
})
export class CounterModule {}
