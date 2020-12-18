import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetinUserPage } from './meetin-user.page';

describe('MeetinUserPage', () => {
  let component: MeetinUserPage;
  let fixture: ComponentFixture<MeetinUserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetinUserPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetinUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
