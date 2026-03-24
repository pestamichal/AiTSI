import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoList } from './photo-list';

describe('PhotoList', () => {
  let component: PhotoList;
  let fixture: ComponentFixture<PhotoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
