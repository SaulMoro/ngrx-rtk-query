import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailComponent } from './post-detail.component';

describe('PostDetailComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostDetailComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
