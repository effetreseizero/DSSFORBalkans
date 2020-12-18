import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudprojectsPage } from './crudprojects.page';

describe('CrudprojectsPage', () => {
  let component: CrudprojectsPage;
  let fixture: ComponentFixture<CrudprojectsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudprojectsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudprojectsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
