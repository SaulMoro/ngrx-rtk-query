import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyComponent } from './lazy.component';

describe('LazyComponent', () => {
  let component: LazyComponent;
  let fixture: ComponentFixture<LazyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LazyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LazyComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
