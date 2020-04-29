import { Component, OnInit, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { ValidationService } from 'src/app/shared/services/validation.service'
import { AuthServiceService } from 'src/app/shared/services/auth-service.service'
import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup
  email: any = ''
  type = 0
  showForgotPasswordSuccess = false

  constructor(
    public toastr: ToastrService,
    private router: Router,
    private validationService: ValidationService,
    private authService: AuthServiceService,
    private elementReference: ElementRef
  ) { }


  ngOnInit(): void {
    this.setForgotPasswordForm()
  }
  public setForgotPasswordForm() {
    this.email = new FormControl('', [
      Validators.required,
      this.validationService.emailValidator,
    ])

    this.forgotPasswordForm = new FormGroup({
      email: this.email,
    })
  }
  public forgotPassword() {
    const data: any = {}
    if (!this.forgotPasswordForm.valid) {
      this.validationService.validateAllFormFields(this.forgotPasswordForm)
      for (const key of Object.keys(this.forgotPasswordForm.controls)) {
        if (this.forgotPasswordForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector('[formcontrolname="' + key + '"]');
          invalidControl.focus();
          break;
        }
      }
      return false
    }
    localStorage.setItem('email', this.forgotPasswordForm.value.email)
    data.email = this.forgotPasswordForm.value.email
    this.authService.forgotPassword(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.showForgotPasswordSuccess = true
        } else if (returnData.success === false) {
          this.toastr.error(returnData.message)
        }
      },
      err => {
        this.toastr.error(err.message)
      }
    )
  }
  public backToLogin() {
    if (this.authService.type === 1) {
      this.router.navigateByUrl('/auth/caregiver-login')
    } else if (this.authService.type === 2) {
      this.router.navigateByUrl('/auth/client-login')
    } else {
      this.router.navigateByUrl('/pages')
    }
  }
  sendMailAgain() {
    const email = localStorage.getItem('email')
    const data: any = {}
    data.email = email
    this.authService.resendForgotPasswordMail(data).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.showForgotPasswordSuccess = true
          this.toastr.success(returnData.message)
        }
      },
      err => {
        this.showForgotPasswordSuccess = true
        this.toastr.error(err.message)
      }
    )
  }
}
