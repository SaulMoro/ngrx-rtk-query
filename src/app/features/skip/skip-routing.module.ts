import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkipContainerComponent } from './skip-container/skip-container.component';

const routes: Routes = [{ path: '', component: SkipContainerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SkipRoutingModule {}
