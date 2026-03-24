import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePhoto } from './create-photo';

describe('CreatePhoto', () => {
  let component: CreatePhoto;
  let fixture: ComponentFixture<CreatePhoto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePhoto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePhoto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
