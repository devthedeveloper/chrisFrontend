import { Component, OnInit, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../shared/services/global.service';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { fromJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';

@Component({
  selector: 'app-charges',
  templateUrl: './charges.component.html',
})
export class ChargesComponent implements OnInit {
  currentStepFromStorage: any;
  CaregiverChargesForm = new FormGroup({});
  uniqueNumber = 0;
  hourlyRateArray: any = ['1', '2', '3', '4', '5', '6', '7'];
  chargesFromAPI: any = [];
  allHours: any = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ];
  registrationNo = 0;
  editMode = false;
  chargesData: any;
  fb = new FormBuilder();
  currentUrlSection: any = '';
  profileMode = false;
  constructor(
    private validationService: ValidationService,
    private router: Router,
    private global: GlobalService,
    private elementReference: ElementRef,
    private caregiverService: CaregiverService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
  ) {
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
  }
  ngOnInit(): void {
    const urlParts: any = this.router.url.split('/');
    this.currentUrlSection = urlParts[2];
    if (this.currentUrlSection === 'profile') {
      this.profileMode = true;
      localStorage.setItem('caregiverOnBoardCompleted', '1');
    } else {
      this.profileMode = false;
      localStorage.setItem('caregiverOnBoardCompleted', '0');
    }
    this.setChargesForm();
    this.onlinePaymentValidation();
    this.registrationNo = Number(localStorage.getItem('registeredNumber'));
    this.getCharges();
  }
  setChargesForm() {
    this.CaregiverChargesForm = new FormGroup({
      hourly_rate: this.createHourlyRate(this.hourlyRateArray),
      payment_method_online: new FormControl(),
      payment_method_cheque: new FormControl(),
      fps_mobile_number: new FormControl('', [
        Validators.maxLength(8),
        Validators.minLength(8),
        this.validationService.onlyNumber,
      ]),
      bank_name: new FormControl('', [Validators.maxLength(50)]),
      bank_code: new FormControl('', [Validators.maxLength(15)]),
      branch_code: new FormControl('', [Validators.maxLength(15)]),
      account_no: new FormControl('', [
        Validators.maxLength(20),
        this.validationService.onlyNumber,
      ]),
      account_name: new FormControl('', [Validators.maxLength(20)]),
    });
  }
  createHourlyRate(hourlyInput) {
    return this.fb.array(
      hourlyInput.map(i => {
        return this.fb.group({
          hour: i,
          price: '',
          value: '',
          id: '',
        });
      }),
    );
  }

  onlinePaymentValidation() {
    const fpsMobileNumber = this.CaregiverChargesForm.get('fps_mobile_number');
    const bankName = this.CaregiverChargesForm.get('bank_name');
    const bankCode = this.CaregiverChargesForm.get('bank_code');
    const branchCode = this.CaregiverChargesForm.get('branch_code');
    const accountNo = this.CaregiverChargesForm.get('account_no');
    const accountName = this.CaregiverChargesForm.get('account_name');
    this.CaregiverChargesForm.get(
      'payment_method_online',
    ).valueChanges.subscribe(paymentMethodOnline => {
      if (paymentMethodOnline === true) {
        fpsMobileNumber.setValidators([
          Validators.required,
          this.validationService.onlyNumber,
        ]);
        bankName.setValidators([Validators.required]);
        bankCode.setValidators([
          Validators.required,
          this.validationService.onlyNumber,
        ]);
        branchCode.setValidators([
          Validators.required,
          this.validationService.onlyNumber,
        ]);
        accountNo.setValidators([
          Validators.required,
          this.validationService.onlyNumber,
        ]);
        accountName.setValidators([Validators.required]);
      } else if (paymentMethodOnline === false) {
        this.CaregiverChargesForm.controls['fps_mobile_number'].setValue(null);
        this.CaregiverChargesForm.controls['bank_name'].setValue(null);
        this.CaregiverChargesForm.controls['bank_code'].setValue(null);
        this.CaregiverChargesForm.controls['branch_code'].setValue(null);
        this.CaregiverChargesForm.controls['account_no'].setValue(null);
        this.CaregiverChargesForm.controls['account_name'].setValue(null);
        fpsMobileNumber.setValidators(null);
        bankName.setValidators(null);
        bankCode.setValidators(null);
        branchCode.setValidators(null);
        accountNo.setValidators(null);
        accountName.setValidators(null);
      }
      fpsMobileNumber.updateValueAndValidity();
      bankName.updateValueAndValidity();
      bankCode.updateValueAndValidity();
      branchCode.updateValueAndValidity();
      accountNo.updateValueAndValidity();
      accountName.updateValueAndValidity();
    });
  }
  getCharges() {
    this.caregiverService
      .getCharges(this.registrationNo)
      .subscribe((returnData: any) => {
        if (returnData.success === true) {
          this.chargesFromAPI = returnData.data.charges;
          const chargesObj: any = {};
          chargesObj.hourly_rate = [];
          if (returnData.data.charges.length > 0) {
            this.CaregiverChargesForm.controls.hourly_rate['controls'].map(
              (control: any, index) => {
                const matched = returnData.data.charges.find(
                  element => element.hour === index + 1,
                );
                if (matched) {
                  chargesObj.hourly_rate.push(matched);
                } else {
                  chargesObj.hourly_rate.push({
                    id: '',
                    caregiver_id: '',
                    hour: index + 1,
                    price: '',
                  });
                }
              },
            );
          }

          chargesObj.fps_mobile_number = returnData.data.fps_mobile_number;
          chargesObj.bank_name = returnData.data.bank_name;
          chargesObj.bank_code = returnData.data.bank_code;
          chargesObj.branch_code = returnData.data.branch_code;
          chargesObj.account_no = returnData.data.account_no;
          chargesObj.account_name = returnData.data.account_name;
          chargesObj.payment_method_online = Boolean(
            returnData.data.payment_method_online,
          );
          chargesObj.payment_method_cheque = Boolean(
            returnData.data.payment_method_cheque,
          );
          this.CaregiverChargesForm.patchValue(chargesObj);
          this.chargesData = this.CaregiverChargesForm.value.hourly_rate;

          if (this.chargesData.length !== 0) {
            this.editMode = true;
          }
        }
      });
  }
  changeMode(event, i) {
    this.editMode = true;
    const charges = this.CaregiverChargesForm.get('hourly_rate') as FormArray;

    charges.at(i).setValue({
      price: event.target.value,
      hour: charges.controls[i]['controls']['hour']['value'],
      value: charges.controls[i]['controls']['value']['value'],
      id: charges.controls[i]['controls']['id']['value'],
    });
  }
  addUpdateCharges() {
    let j = 0;
    if (!this.CaregiverChargesForm.valid) {
      this.validationService.validateAllFormFields(this.CaregiverChargesForm);
      return false;
    }
    const chargesArray: any = [];
    this.chargesFromAPI.map((apiResponse: any, index) => {
      const tempArray: any = {};
      const matched = this.CaregiverChargesForm.value.hourly_rate.find(
        element => element.hour === apiResponse.hour,
      );
      if (apiResponse.hour < 7) {
        tempArray.id = apiResponse.id;
        tempArray.hour = apiResponse.hour;
        tempArray.price = matched.price;
      } else {
        const matchedLast = this.CaregiverChargesForm.value.hourly_rate.find(
          element => element.hour === 7,
        );

        tempArray.id = apiResponse.id;
        tempArray.hour = apiResponse.hour;
        tempArray.price = matchedLast.price;
      }
      chargesArray.push(tempArray);
    });
    this.CaregiverChargesForm.value.charges = [];
    this.CaregiverChargesForm.value.deleted_charges = [];
    this.CaregiverChargesForm.value.hourly_rate.map(
      (inputArray: any, index) => {
        if (inputArray.id === '' || inputArray.id === null) {
          chargesArray.push({
            hour: inputArray.hour,
            price: inputArray.price,
          });
        }
      },
    );
    chargesArray.map((final: any) => {
      if (final.price !== null && final.price !== '') {
        this.CaregiverChargesForm.value.charges.push(final);
      } else {
        if (final.id) {
          this.CaregiverChargesForm.value.deleted_charges.push(final.id);
        }
      }
    });

    for (let i = 0; i < 6; i++) {
      if (
        this.CaregiverChargesForm.value.hourly_rate[i].price === '' ||
        this.CaregiverChargesForm.value.hourly_rate[i].price === null
      ) {
        j++;
        if (j === 6) {
          this.toastr.error('Please write input for single hour rate');
          return false;
        }
      }
    }

    if (
      this.CaregiverChargesForm.value.payment_method_cheque === null &&
      this.CaregiverChargesForm.value.payment_method_online === null
    ) {
      this.toastr.error('Please select a payment method');
      return false;
    } else if (
      this.CaregiverChargesForm.value.payment_method_cheque === false &&
      this.CaregiverChargesForm.value.payment_method_online === false
    ) {
      this.toastr.error('Please select a payment method');
      return false;
    }
    if (this.CaregiverChargesForm.value.payment_method_online === null) {
      this.CaregiverChargesForm.value.payment_method_online = false;
    }
    this.onlinePaymentValidation();
    this.CaregiverChargesForm.value.payment_method_online = Number(
      this.CaregiverChargesForm.value.payment_method_online,
    );
    this.CaregiverChargesForm.value.payment_method_cheque = Number(
      this.CaregiverChargesForm.value.payment_method_cheque,
    );
    this.CaregiverChargesForm.value.registration_no = this.registrationNo;

    this.caregiverService
      .addUpdateCharges(this.CaregiverChargesForm.value)
      .subscribe(
        (returnData: any) => {
          if (returnData.success === true) {
            this.toastr.success(returnData.message);
            if (this.profileMode === true) {
              localStorage.setItem('currentOnBoardingStep', '0');
              this.router.navigate(['/caregiver/profile/referral-bonus']);
            } else {
              localStorage.setItem('currentOnBoardingStep', '6');
              if (this.currentStepFromStorage > 5) {
                this.global.currentOnBoardStep = this.currentStepFromStorage;
              } else {
                this.global.currentOnBoardStep = 5;
              }
              this.router.navigate(['/caregiver/onboard/documents']);
            }
          }
        },
        err => {
          if (err.status === 400) {
            this.global.errorHandling(err, this.CaregiverChargesForm);
            this.validationService.validateAllFormFields(
              this.CaregiverChargesForm,
            );
          } else {
            console.error(err);
          }
        },
      );
  }
  convertString(value) {
    return String(value);
  }
}
