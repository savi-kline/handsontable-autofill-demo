import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { HandsonTableComponent } from './shared/handson-table/handson-table.component';
import { HotTableModule } from '@handsontable/angular';
import { DxDropDownButtonModule } from 'devextreme-angular';
import {
  registerAllModules,
  registerAllRenderers,
} from 'handsontable/registry';
registerAllRenderers();
registerAllModules();

@NgModule({
  declarations: [AppComponent, HandsonTableComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    NgSelectModule,
    HotTableModule.forRoot(),
    DxDropDownButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
