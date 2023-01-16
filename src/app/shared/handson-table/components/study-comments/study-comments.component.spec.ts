import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCommentsComponent } from './study-comments.component';

describe('StudyCommentsComponent', () => {
  let component: StudyCommentsComponent;
  let fixture: ComponentFixture<StudyCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
