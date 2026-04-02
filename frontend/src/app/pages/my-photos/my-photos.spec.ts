import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPhotos } from './my-photos';

describe('MyPhotos', () => {
  let component: MyPhotos;
  let fixture: ComponentFixture<MyPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPhotos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
