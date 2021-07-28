import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PopoverMenuComponent } from './popover-menu/popover-menu.component';
import { PopoverComponent } from './popover/popover.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports:[PopoverMenuComponent],
  declarations: [PopoverMenuComponent,PopoverComponent]
})
export class SharedModule {}
