import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtentComponent } from './extent.component';

describe('ExtentComponent', () => {
  let component: ExtentComponent;
  let fixture: ComponentFixture<ExtentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtentComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
