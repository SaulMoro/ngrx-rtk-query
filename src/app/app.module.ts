import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideCoreStore } from '@app/core/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideCoreStore()],
  bootstrap: [AppComponent],
})
export class AppModule {}
