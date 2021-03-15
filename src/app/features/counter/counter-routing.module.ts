import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CounterManagerComponent } from './counter-manager/counter-manager.component';

const routes: Routes = [{ path: '', component: CounterManagerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CounterRoutingModule {}
