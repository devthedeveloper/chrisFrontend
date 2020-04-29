import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-referral-bonus',
  templateUrl: './referral-bonus.component.html',
})
export class ReferralBonusComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    localStorage.setItem('currentOnBoardingStep', '0');
  }
}
