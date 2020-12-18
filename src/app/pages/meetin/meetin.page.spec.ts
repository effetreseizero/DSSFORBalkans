import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetinPage } from './meetin.page';

describe('MeetinPage', () => {
  let component: MeetinPage;
  let fixture: ComponentFixture<MeetinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
