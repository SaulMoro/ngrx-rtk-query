import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreStoreModule } from '@app/core/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CoreStoreModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
