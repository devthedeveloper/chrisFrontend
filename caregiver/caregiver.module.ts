import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaregiverRoutingModule } from './caregiver-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ControlMessagesModule } from 'src/app/control-messages/control-messages.module';
import { CaregiverProfileResolver } from './profile.resolver';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CaregiverOnboardResolver } from './onboard.resolver';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CaregiverRoutingModule,
    TranslateModule.forChild(),
    ControlMessagesModule,
    AngularMultiSelectModule,
  ],
  providers: [CaregiverProfileResolver, CaregiverOnboardResolver],
})
export class CaregiverModule {}
