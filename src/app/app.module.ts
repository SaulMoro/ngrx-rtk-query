import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppStoreModule } from './app.store';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, AppStoreModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
