import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostManagerComponent } from './post-manager.component';

describe('PostManagerComponent', () => {
  let component: PostManagerComponent;
  let fixture: ComponentFixture<PostManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostManagerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
