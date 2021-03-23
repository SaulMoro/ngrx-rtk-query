import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterManagerComponent } from './counter-manager.component';

describe('CounterManagerComponent', () => {
  let component: CounterManagerComponent;
  let fixture: ComponentFixture<CounterManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterManagerComponent],
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
