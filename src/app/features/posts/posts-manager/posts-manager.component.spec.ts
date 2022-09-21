import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsManagerComponent } from './posts-manager.component';

describe('PostsManagerComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: PostsManagerComponent;
  let fixture: ComponentFixture<PostsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostsManagerComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsManagerComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
