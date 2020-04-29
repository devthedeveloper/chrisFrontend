import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared/services/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {
  currentStepFromStorage: any;
  constructor(private global: GlobalService, private router: Router) {
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
  }

  ngOnInit(): void {}
  redirection() {
    localStorage.setItem('currentOnBoardingStep', '7');
    if (this.currentStepFromStorage > 6) {
      this.global.currentOnBoardStep = this.currentStepFromStorage;
    } else {
      this.global.currentOnBoardStep = 6;
    }
    this.router.navigate(['/caregiver/onboard/terms-and-condition']);
  }
  redirectionPrevious() {
    this.router.navigate(['/caregiver/onboard/charges']);
  }
}
