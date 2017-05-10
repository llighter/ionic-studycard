import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardDetail } from './card-detail';

@NgModule({
  declarations: [
    CardDetail,
  ],
  imports: [
    IonicPageModule.forChild(CardDetail),
  ],
  exports: [
    CardDetail
  ]
})
export class CardDetailModule {}
