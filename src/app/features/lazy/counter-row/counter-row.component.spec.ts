import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterRowComponent } from './counter-row.component';

describe('CounterRowComponent', () => {
  let component: CounterRowComponent;
  let fixture: ComponentFixture<CounterRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterRowComponent],
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
