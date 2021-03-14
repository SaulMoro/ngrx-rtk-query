import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgrxRtkQueryModule } from 'ngrx-rtk-query';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NgrxRtkQueryModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
