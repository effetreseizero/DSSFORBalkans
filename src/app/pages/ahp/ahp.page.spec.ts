import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AhpPage } from './ahp.page';

describe('AhpPage', () => {
  let component: AhpPage;
  let fixture: ComponentFixture<AhpPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AhpPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AhpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
