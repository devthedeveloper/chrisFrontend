import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PersonalInfoComponent } from './personal-info/personal-info.component'
import { LayoutComponent } from './layout/layout.component'
import { WorkInfoComponent } from './work-info/work-info.component'
import { SkillsetComponent } from './skillset/skillset.component'
import { AvailabilityComponent } from './availability/availability.component'
import { ChargesComponent } from './charges/charges.component'
import { DocumentsComponent } from './documents/documents.component'
import { TermsComponent } from './terms/terms.component'
import { ThankyouComponent } from './thankyou/thankyou.component'
import { ReferralBonusComponent } from './referral-bonus/referral-bonus.component'

const routes: Routes = [
  { path: '', redirectTo: 'personal-info', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'personal-info',
        component: PersonalInfoComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'work-info',
        component: WorkInfoComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'skillset',
        component: SkillsetComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'availability',
        component: AvailabilityComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'charges',
        component: ChargesComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'documents',
        component: DocumentsComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'terms-and-condition',
        component: TermsComponent,
        data: {
          title: 'Home',
        },
      },
      {
        path: 'referral-bonus',
        component: ReferralBonusComponent,
        data: {
          title: 'Home',
        },
      },
    ],
  },
  {
    path: 'thankyou',
    component: ThankyouComponent,
    data: {
      title: 'Thankyou',
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardRoutingModule {}
