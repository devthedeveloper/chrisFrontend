import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { AuthServiceService } from 'src/app/shared/services/auth-service.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/app/shared/services/global.service';

@Component({
  selector: 'app-caregiver-login',
  templateUrl: './caregiver-login.component.html',
})
export class CaregiverLoginComponent implements OnInit {
  caregiverLoginForm: FormGroup;
  email: any = '';
  password: any = '';
  rememberMe: any = '';
  rememberedCredentials = false;
  type = 0;
  passwordIconConfirm: any = 'assets/images/eye-open-icon.png';
  passwordIcon: any = 'assets/images/eye-close-icon.png';
  show = false;
  passType: any = 'password';
  constructor(
    public toastr: ToastrService,
    private router: Router,
    private validationService: ValidationService,
    private authService: AuthServiceService,
    public global: GlobalService,
    private elementReference: ElementRef,
  ) {}

  ngOnInit(): void {
    this.setLoginForm();
  }
  toggleShow() {
    this.show = !this.show;
    if (this.show) {
      this.passwordIcon = 'assets/images/eye-open-icon.png';
      this.passType = 'text';
    } else {
      this.passwordIcon = 'assets/images/eye-close-icon.png';
      this.passType = 'password';
    }
  }
  public setLoginForm() {
    this.email = new FormControl('', [
      Validators.required,
      this.validationService.emailValidator,
    ]);

    this.password = new FormControl('', [
      Validators.required,
      this.validationService.passwordValidator,
    ]);

    this.rememberMe = new FormControl('');

    this.caregiverLoginForm = new FormGroup({
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });
    this.rememberMeCheck();
  }
  rememberMeCheck() {
    if (localStorage.getItem('checkBoxValidationCaregiver') !== null) {
      this.rememberedCredentials = true;
      const decoded = JSON.parse(
        atob(localStorage.getItem('checkBoxValidationCaregiver')),
      );
      console.log('this.rememberedCredentials >>>>>>>', decoded);
      this.caregiverLoginForm.patchValue(decoded);
    }
  }
  public login() {
    const data: any = {};
    if (!this.caregiverLoginForm.valid) {
      this.validationService.validateAllFormFields(this.caregiverLoginForm);
      for (const key of Object.keys(this.caregiverLoginForm.controls)) {
        if (this.caregiverLoginForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]',
          );
          invalidControl.focus();
          break;
        }
      }
      return false;
    }
    data.email = this.caregiverLoginForm.value.email;
    data.password = this.caregiverLoginForm.value.password;
    data.user_type = '2'; // 1=admin,2=caregiver,3=client

    this.authService.caregiverLogin(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          if (this.caregiverLoginForm.value.rememberMe === true) {
            const userData: any = {};
            userData.email = this.caregiverLoginForm.value.email;
            userData.password = this.caregiverLoginForm.value.password;
            userData.rememberMe = true;
            console.log('userData >>>>>>>>>', userData);
            const encoded = btoa(JSON.stringify(userData));
            localStorage.setItem('checkBoxValidationCaregiver', encoded);
          }
          localStorage.setItem('user_type', data.user_type);
          localStorage.setItem('englishName', returnData.data.english_name);
          localStorage.setItem('token', returnData.data.accessToken.token);
          localStorage.setItem(
            'registeredNumber',
            returnData.data.registration_no,
          );
          localStorage.setItem(
            'currentOnBoardingStep',
            returnData.data.current_step,
          );
          localStorage.setItem(
            'currentCaregiverType',
            returnData.data.caregiver_type,
          );
          localStorage.setItem('user_type', data.user_type);
          this.global.currentOnBoardStep = returnData.data.current_step;
          this.global.caregiverOnBoardCompleted = '0';
          localStorage.setItem('caregiverOnBoardCompleted', '0');
          localStorage.setItem('showCaregiverMyProfile', '0');
          this.global.showCaregiverMyProfile = '0';
          if (String(this.global.currentOnBoardStep) === '1') {
            this.router.navigateByUrl('/caregiver/onboard/personal-info');
          } else if (String(this.global.currentOnBoardStep) === '2') {
            this.router.navigateByUrl('/caregiver/onboard/work-info');
          } else if (String(this.global.currentOnBoardStep) === '3') {
            this.router.navigateByUrl('/caregiver/onboard/skillset');
          } else if (String(this.global.currentOnBoardStep) === '4') {
            this.router.navigateByUrl('/caregiver/onboard/availability');
          } else if (String(this.global.currentOnBoardStep) === '5') {
            this.router.navigateByUrl('/caregiver/onboard/charges');
          } else if (String(this.global.currentOnBoardStep) === '6') {
            this.router.navigateByUrl('/caregiver/onboard/documents');
          } else if (String(this.global.currentOnBoardStep) === '7') {
            this.router.navigateByUrl('/caregiver/onboard/terms-and-condition');
          } else {
            localStorage.setItem('showCaregiverMyProfile', '1');
            this.global.showCaregiverMyProfile = '1';
            localStorage.setItem('caregiverOnBoardCompleted', '1');
            this.global.caregiverOnBoardCompleted = '1';
            this.router.navigateByUrl('/caregiver/profile/personal-info');
          }

          // else if (returnData.success === false) {
          //   this.toastr.error(returnData.message);
          // }
        }
      },
      err => {
        this.toastr.error(err.message);
      },
    );
  }
  forgotPassword() {
    this.type = 1; // 1=admin,2=caregiver,3=client
    this.authService.setGetType(this.type);
    this.router.navigateByUrl('/auth/forgot-password');
  }
}
