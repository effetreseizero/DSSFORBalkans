import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportsPage } from './exports.page';

describe('ExportsPage', () => {
  let component: ExportsPage;
  let fixture: ComponentFixture<ExportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
