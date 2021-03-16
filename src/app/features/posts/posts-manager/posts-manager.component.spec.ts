import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsManagerComponent } from './posts-manager.component';

describe('PostsManagerComponent', () => {
  let component: PostsManagerComponent;
  let fixture: ComponentFixture<PostsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostsManagerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
