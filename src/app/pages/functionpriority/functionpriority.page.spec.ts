import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionpriorityPage } from './functionpriority.page';

describe('FunctionpriorityPage', () => {
  let component: FunctionpriorityPage;
  let fixture: ComponentFixture<FunctionpriorityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionpriorityPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionpriorityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
