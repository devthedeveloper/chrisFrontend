import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthServiceService } from 'src/app/shared/services/auth-service.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  token: any = '';
  resetPasswordForm: FormGroup;
  password: any = '';
  cnfmpassword: any = '';
  score = 0;
  showResetSuccess = false;
  passwordIconConfirm: any = 'assets/images/eye-open-icon.png';
  passwordIcon: any = 'assets/images/eye-close-icon.png';
  show = false;
  passType: any = 'password';
  constructor(
    public toastr: ToastrService,
    private route: ActivatedRoute,
    private validationService: ValidationService,
    private formBuilder: FormBuilder,
    private authService: AuthServiceService,
    private elementReference: ElementRef,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.route.queryParamMap.subscribe(queryParams => {
      this.token = queryParams.get('token');
    });
    this.setResetPasswordForm();
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
  public setResetPasswordForm() {
    this.password = new FormControl('', [
      Validators.required,
      this.validationService.passwordValidator,
    ]);
    this.cnfmpassword = new FormControl('', [
      Validators.required,
      this.validationService.passwordValidator,
    ]);

    this.resetPasswordForm = this.formBuilder.group(
      {
        password: this.password,
        cnfmpassword: this.cnfmpassword,
      },
      {
        validators: this.validationService.MatchPassword,
      },
    );
  }
  public resetPassword() {
    const data: any = {};
    if (!this.resetPasswordForm.valid) {
      this.validationService.validateAllFormFields(this.resetPasswordForm);
      for (const key of Object.keys(this.resetPasswordForm.controls)) {
        if (this.resetPasswordForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]',
          );
          invalidControl.focus();
          break;
        }
      }
      return false;
    }

    data.password = this.resetPasswordForm.value.password;
    data.token = this.token;
    this.authService.resetPassword(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          localStorage.clear();
          this.showResetSuccess = true;
        }
      },
      err => {
        this.toastr.error(err.message);
      },
    );
  }
  passwordStrength(event) {
    const pass = event.target.value;
    this.score = 0;
    if (pass == null) {
      this.score = -1;
      return this.score;
    }
    if (pass.length < 6) {
      this.score = 1;
      return this.score;
    }
    if (/[0-9]/.test(pass)) {
      this.score++;
    }
    if (/[a-z]/.test(pass)) {
      this.score++;
    }
    if (/[A-Z]/.test(pass)) {
      this.score++;
    }
    if (/[^A-Z-0-9]/i.test(pass)) {
      // this.score++;
    }
    return this.score;
  }
}
