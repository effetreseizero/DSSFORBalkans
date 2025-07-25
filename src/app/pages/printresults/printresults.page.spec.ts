import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintresultsPage } from './printresults.page';

describe('PrintresultsPage', () => {
  let component: PrintresultsPage;
  let fixture: ComponentFixture<PrintresultsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintresultsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintresultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
