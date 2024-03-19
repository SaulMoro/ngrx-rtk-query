import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    <div class="flex h-full min-h-screen flex-col gap-6 p-4">
      <header>
        <h1 class="text-xl font-bold">RTK Query - Basic example with ngrx/store</h1>
      </header>
      <main class="flex-grow overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
