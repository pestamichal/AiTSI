import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPhoto } from './edit-photo';

describe('EditPhoto', () => {
  let component: EditPhoto;
  let fixture: ComponentFixture<EditPhoto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPhoto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPhoto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
