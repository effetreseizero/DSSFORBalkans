import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetinResultPage } from './meetin-result.page';

describe('MeetinResultPage', () => {
  let component: MeetinResultPage;
  let fixture: ComponentFixture<MeetinResultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetinResultPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetinResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
