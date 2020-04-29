import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared/services/global.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { Router } from '@angular/router';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
})
export class TermsComponent implements OnInit {
  maxDate: any = '';
  termsForm: FormGroup;
  registrationNo = 0;
  currentDate: any = '';
  currentStepFromStorage: any;
  constructor(
    private validationService: ValidationService,
    public global: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private caregiverService: CaregiverService,
  ) {
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
    if (localStorage.getItem('showCaregiverMyProfile') === '1') {
      this.router.navigate(['/caregiver/profile/personal-info']);
    }
  }

  ngOnInit(): void {
    this.registrationNo = Number(localStorage.getItem('registeredNumber'));
    const current = new Date();
    this.maxDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),
    };
    this.setTermsForm();
    this.patchDate();
  }
  patchDate() {
    const d = new Date();
    let monthNew = '' + (d.getMonth() + 1);
    let daynew = '' + d.getDate();
    const yearNew = String(d.getFullYear());

    if (monthNew.length < 2) {
      monthNew = '0' + monthNew;
    }
    if (daynew.length < 2) {
      daynew = '0' + daynew;
    }

    this.currentDate = {
      year: parseInt(yearNew, 10),
      month: parseInt(monthNew, 10),
      day: parseInt(daynew.split(' ')[0].trim(), 10),
    };
    this.termsForm.patchValue({
      date: this.currentDate,
    });
  }
  setTermsForm() {
    this.termsForm = new FormGroup({
      hkid_fullName: new FormControl('', [
        Validators.required,
        this.validationService.trimValidator,
        Validators.maxLength(30),
        this.validationService.onlyChars,
      ]),
      date: new FormControl({ disabled: true }, [Validators.required]),
    });
  }
  public submitDetails() {
    if (!this.termsForm.valid) {
      this.validationService.validateAllFormFields(this.termsForm);
      return false;
    }

    const dateOfBirth = new Date(
      this.termsForm.value.date.year,
      this.termsForm.value.date.month - 1,
      this.termsForm.value.date.day,
    );
    const formatedDated =
      dateOfBirth.getFullYear() +
      '-' +
      ('0' + (dateOfBirth.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + dateOfBirth.getDate()).slice(-2);
    this.termsForm.value.date = formatedDated;
    const sendingData: any = {};
    sendingData.registration_no = this.registrationNo;
    sendingData.tnc_accepted_date = this.termsForm.value.date;
    sendingData.hkid_name = this.termsForm.value.hkid_fullName;

    this.caregiverService.sendTermsAndConditionsMail(sendingData).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          localStorage.setItem('currentOnBoardingStep', '0');
          if (this.currentStepFromStorage > 7) {
            this.global.currentOnBoardStep = this.currentStepFromStorage;
          } else {
            this.global.currentOnBoardStep = 7;
          }
          this.global.caregiverOnBoardCompleted = '1';
          localStorage.setItem('caregiverOnBoardCompleted', '1');
          localStorage.setItem('showCaregiverMyProfile', '1');
          this.global.showCaregiverMyProfile = '1';
          // this.toastr.success(returnData.message);
          this.router.navigate(['/caregiver/onboard/thankyou']);
        }
      },
      err => {
        if (err.status === 400) {
          this.global.errorHandling(err, this.termsForm);
          this.validationService.validateAllFormFields(this.termsForm);
        } else {
          console.error(err);
        }
      },
    );
  }
}
