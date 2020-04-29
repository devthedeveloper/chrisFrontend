import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { AuthServiceService } from 'src/app/shared/services/auth-service.service';
import { GlobalService } from 'src/app/shared/services/global.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-login',
  templateUrl: './client-login.component.html',
})
export class ClientLoginComponent implements OnInit {
  clientLoginForm: FormGroup;
  email: any = '';
  password: any = '';
  type = 0;
  rememberedCredentials = false;
  rememberMe: any = '';
  searchData: any;
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
    private activatedRoute: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.searchData = this.activatedRoute.snapshot.paramMap.get('searchData');
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

    this.clientLoginForm = new FormGroup({
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });
    this.rememberMeCheck();
  }
  rememberMeCheck() {
    if (localStorage.getItem('checkBoxValidation') !== null) {
      this.rememberedCredentials = true;
      const decoded = JSON.parse(
        atob(localStorage.getItem('checkBoxValidation')),
      );
      console.log('decoded >>>>>>', decoded);
      this.clientLoginForm.patchValue(decoded);
    }
  }

  public login() {
    const data: any = {};
    if (!this.clientLoginForm.valid) {
      this.validationService.validateAllFormFields(this.clientLoginForm);
      for (const key of Object.keys(this.clientLoginForm.controls)) {
        if (this.clientLoginForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]',
          );
          invalidControl.focus();
          break;
        }
      }
      return false;
    }
    data.email = this.clientLoginForm.value.email;
    data.password = this.clientLoginForm.value.password;
    data.user_type = '3'; // 1=admin,2=caregiver,3=client
    const checkBoxValidation: any = {};
    checkBoxValidation.email = this.clientLoginForm.value.email;
    checkBoxValidation.password = this.clientLoginForm.value.password;
    this.authService.caregiverLogin(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          if (this.clientLoginForm.value.rememberMe === true) {
            const userData: any = {};
            userData.email = this.clientLoginForm.value.email;
            userData.password = this.clientLoginForm.value.password;
            userData.rememberMe = true;
            const encoded = btoa(JSON.stringify(userData));
            localStorage.setItem('checkBoxValidation', encoded);
          }
          localStorage.setItem('token', returnData.data.accessToken.token);
          localStorage.setItem('user_id', returnData.data.user_id);
          localStorage.setItem('email', returnData.data.email);
          localStorage.setItem('user_type', data.user_type);
          if (returnData.data.first_name && returnData.data.last_name) {
            localStorage.setItem(
              'englishName',
              returnData.data.first_name + ' ' + returnData.data.last_name,
            );
          } else {
            localStorage.setItem('englishName', 'Guest');
          }

          if (returnData.data.current_step) {
            localStorage.setItem('current_step', returnData.data.current_step);
            this.global.currentStep = returnData.data.current_step;
          } else {
            localStorage.setItem('current_step', null);
            this.global.currentStep = null;
          }
          if (returnData.data.slug) {
            localStorage.setItem('slug', returnData.data.slug);
          }

          // else if (returnData.success === false) {
          //   this.toastr.error(returnData.message);
          // }
          if (this.searchData && this.searchData !== null) {
            this.router.navigateByUrl(
              `/pages/caregiver/search/${this.searchData}`,
            );
          } else {
            const url = this.authService.redirectClient();
            this.router.navigateByUrl(url);
          }
        }
      },
      err => {
        this.toastr.error(err.message);
      },
    );
  }

  forgotPassword() {
    this.type = 2; // 1=admin,2=caregiver,3=client
    this.authService.setGetType(this.type);
    this.router.navigateByUrl('/auth/forgot-password');
  }
}
