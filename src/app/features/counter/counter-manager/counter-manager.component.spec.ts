import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterManagerComponent } from './counter-manager.component';

describe('CounterManagerComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: CounterManagerComponent;
  let fixture: ComponentFixture<CounterManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterManagerComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterManagerComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
