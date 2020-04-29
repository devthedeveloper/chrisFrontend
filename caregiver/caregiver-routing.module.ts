import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageslayoutComponent } from 'src/app/layouts/pageslayout/pageslayout.component';
import { AuthGuardGuard } from 'src/app/shared/guards/auth-guard.guard';
import { SearchComponent } from './search/search.component';
import { CaregiverProfileResolver } from './profile.resolver';
import { CaregiverOnboardResolver } from './onboard.resolver';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'onboard',
        loadChildren: () =>
          import('./onboard/onboard.module').then(m => m.OnboardModule),
        canActivate: [AuthGuardGuard],
        resolve: {
          page: CaregiverOnboardResolver,
        },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./onboard/onboard.module').then(m => m.OnboardModule),
        canActivate: [AuthGuardGuard],
        resolve: {
          page: CaregiverProfileResolver,
        },
      },
      {
        path: 'profile-view',
        loadChildren: () =>
          import('./profile/profile.module').then(m => m.ProfileModule),
        // canActivate: [AuthGuardGuard],
      },
      {
        path: 'search',
        component: SearchComponent,
        data: {
          title: 'Search Caregiver',
        },
      },
      {
        path: 'search/:data',
        component: SearchComponent,
        data: {
          title: 'Search Caregiver',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaregiverRoutingModule {}
