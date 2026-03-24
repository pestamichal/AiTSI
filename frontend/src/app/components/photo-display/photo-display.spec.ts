import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoDisplay } from './photo-display';

describe('PhotoDisplay', () => {
  let component: PhotoDisplay;
  let fixture: ComponentFixture<PhotoDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
