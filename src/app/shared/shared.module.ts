import { DescriptionComponent } from './modals/description/description.component';
import { LogoutModalComponent } from './modals/logout-modal/logout-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActionModalComponent } from './modals/action-modal/action-modal.component';
import { ExtentComponent } from './modals/extent/extent.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LanguagePopoverComponent } from './language-popover/language-popover.component';
import { SettingsMapComponent } from './settings-map/settings-map.component';
import { MapinfoComponent } from './modals/mapinfo/mapinfo.component';
import { Ng5SliderModule } from 'ng5-slider';
import { ExpandableComponent } from './expandable/expandable.component';
 

const COMPONENTS = [
    LanguagePopoverComponent,
    SettingsMapComponent,
    ExtentComponent,
    ActionModalComponent,
    MapinfoComponent,
    LogoutModalComponent,
    ExpandableComponent,
    DescriptionComponent
];

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        TranslateModule,
        Ng5SliderModule
    ],
    exports: [
        ...COMPONENTS
    ],
    entryComponents: [
        ActionModalComponent,
        MapinfoComponent,
        SettingsMapComponent,
        DescriptionComponent
    ]
})
export class SharedModule { }
