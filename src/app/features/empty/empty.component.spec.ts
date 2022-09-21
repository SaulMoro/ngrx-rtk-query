import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyComponent } from './empty.component';

describe('EmptyComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: EmptyComponent;
  let fixture: ComponentFixture<EmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
