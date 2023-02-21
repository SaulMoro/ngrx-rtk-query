import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipContainerComponent } from './skip-container.component';

describe('SkipContainerComponent', () => {
  let component: SkipContainerComponent;
  let fixture: ComponentFixture<SkipContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkipContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkipContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
