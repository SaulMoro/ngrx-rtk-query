import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharactersListComponent } from './characters-list.component';

describe('CharactersListComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: CharactersListComponent;
  let fixture: ComponentFixture<CharactersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharactersListComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharactersListComponent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.todo('TODO test');
});
