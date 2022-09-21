import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterRowComponent } from './counter-row.component';

describe('CounterRowComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: CounterRowComponent;
  let fixture: ComponentFixture<CounterRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterRowComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterRowComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
