import { Component, OnInit, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { AuthServiceService } from 'src/app/shared/services/auth-service.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../shared/services/global.service';
@Component({
  selector: 'app-register',
  templateUrl: './caregiver-register.component.html',
})
export class CaregiverRegisterComponent implements OnInit {
  caregiverRegisterForm: FormGroup;
  email: any = '';
  password: any = '';
  cnfmpassword: any = '';
  score = 0;
  showActivateAccount = false;
  passwordIconConfirm: any = 'assets/images/eye-open-icon.png';
  passwordIcon: any = 'assets/images/eye-close-icon.png';
  show = false;
  passType: any = 'password';

  constructor(
    public globalService: GlobalService,
    public toastr: ToastrService,
    private validationService: ValidationService,
    private formBuilder: FormBuilder,
    private authService: AuthServiceService,
    private elementReference: ElementRef,
  ) {}

  ngOnInit(): void {
    this.setRegisterForm();
  }

  public setRegisterForm() {
    this.email = new FormControl('', [
      Validators.required,
      this.validationService.emailValidator,
    ]);

    this.password = new FormControl('', [
      Validators.required,
      this.validationService.passwordValidator,
    ]);
    this.cnfmpassword = new FormControl('', [
      Validators.required,
      this.validationService.passwordValidator,
    ]);

    this.caregiverRegisterForm = this.formBuilder.group(
      {
        email: this.email,
        password: this.password,
        cnfmpassword: this.cnfmpassword,
      },
      {
        validators: this.validationService.MatchPassword,
      },
    );
  }
  public caregiverRegister() {
    const data: any = {};

    if (!this.caregiverRegisterForm.valid) {
      this.validationService.validateAllFormFields(this.caregiverRegisterForm);
      for (const key of Object.keys(this.caregiverRegisterForm.controls)) {
        if (this.caregiverRegisterForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]',
          );
          invalidControl.focus();
          break;
        }
      }
      return false;
    }
    data.email = this.caregiverRegisterForm.value.email;
    data.password = this.caregiverRegisterForm.value.password;
    data.user_type = '2'; // 2=caregiver,3=client
    this.authService.registerCaregiver(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.toastr.success(returnData.message);
          this.showActivateAccount = true;
          localStorage.setItem('email', this.caregiverRegisterForm.value.email);
        }
      },
      err => {
        this.globalService.errorHandling(err, this.caregiverRegisterForm);
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

  activateAccountMailSendAgain() {
    const email = localStorage.getItem('email');
    const data: any = {};
    data.email = email;
    this.authService
      .activateAccountMailSendAgain(data)
      .subscribe((returnData: any) => {
        this.showActivateAccount = true;
        if (returnData.success === true) {
          this.toastr.success(returnData.message);
        } else if (returnData.success === false) {
          this.toastr.error(returnData.message);
        }
      });
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
}
