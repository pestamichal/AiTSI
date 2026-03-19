import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTab } from './filter-tab';

describe('FilterTab', () => {
  let component: FilterTab;
  let fixture: ComponentFixture<FilterTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
