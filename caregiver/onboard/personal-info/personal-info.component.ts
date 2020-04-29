import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Router } from '@angular/router';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
})
export class PersonalInfoComponent implements OnInit {
  personalInfoForm: FormGroup;
  currentStepFromStorage: any;
  maxDate: any = '';
  languageArray: any = [
    { value: 1, name: 'Cantonese', selected: false },
    { value: 2, name: 'English', selected: false },
    { value: 3, name: 'Mandarin', selected: false },
    { value: 4, name: 'Others', selected: false },
  ];
  caregiverType: any = [
    {
      group: 'Nurses',
      types: [
        { id: 1, name: 'RN' },
        { id: 2, name: 'EN' },
      ],
    },
    {
      group: 'Support',
      types: [
        { id: 3, name: 'HW' },
        { id: 4, name: 'PCW' },
        { id: 5, name: 'Out-patient Escort' },
      ],
    },
  ];
  showOtherLanguageOption = false;
  otherLanguageName: any = '';
  registeredNumber: any = 0;
  fb = new FormBuilder();
  currentUrlSection: any = '';
  profileMode = false;
  personalInfoObject: any = {};
  constructor(
    private validationService: ValidationService,
    public global: GlobalService,
    private router: Router,
    private caregiverService: CaregiverService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
    const urlParts: any = this.router.url.split('/');
    this.currentUrlSection = urlParts[2];
    if (this.currentUrlSection === 'profile') {
      this.profileMode = true;
      localStorage.setItem('caregiverOnBoardCompleted', '1');
      localStorage.setItem('currentOnBoardingStep', '0');
    } else {
      this.profileMode = false;
      localStorage.setItem('caregiverOnBoardCompleted', '0');
    }
    this.registeredNumber = localStorage.getItem('registeredNumber');
    const current = new Date();
    this.maxDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),
    };
    this.setPersonalInfoForm();
    if (
      this.registeredNumber &&
      !isNaN(this.registeredNumber) &&
      this.registeredNumber > 0
    ) {
      this.getUserPersonalInfo();
    }
  }
  getUserPersonalInfo() {
    this.caregiverService.getUserPersonalInfo(this.registeredNumber).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          localStorage.setItem(
            'currentCaregiverType',
            returnData.data.caregiver_type,
          );
          if (
            returnData.data.english_name &&
            returnData.data.english_name !== null &&
            returnData.data.english_name !== ''
          ) {
            localStorage.setItem('englishName', returnData.data.english_name);
          }
          returnData.data.salute = returnData.data.user.salute;
          returnData.data.email = returnData.data.user.email;
          returnData.data.mobile_number = returnData.data.user.mobile_number;
          returnData.data.preferred_communication_language =
            returnData.data.user.preferred_communication_language;
          if (returnData.data.user.dob) {
            const [year, month, day] = returnData.data.user.dob.split('-');
            returnData.data.dob = {
              year: parseInt(year, 10),
              month: parseInt(month, 10),
              day: parseInt(day.split(' ')[0].trim(), 10),
            };
          }
          this.personalInfoForm.patchValue(returnData.data);
          this.personalInfoForm.patchValue({
            language: this.prefillLanguageSelection(
              this.personalInfoForm.get('language').value,
              returnData.data.languages,
            ),
          });
          this.personalInfoObject = returnData.data;
        }
      },
      err => {
        console.error(err);
      },
    );
  }
  prefillLanguageSelection(languages, selectedLanguages) {
    return languages.map(i => {
      const data = selectedLanguages.filter(
        x => Number(x.language) === Number(i.value),
      )[0];

      if (data) {
        i.selected = true;
        if (i.value === 4) {
          this.showOtherLanguageOption = true;
          if (this.profileMode === true) {
            this.otherLanguageName = new FormControl(
              { value: '', disabled: false },
              [
                Validators.required,
                this.validationService.trimValidator,
                Validators.maxLength(30),
              ],
            );
          } else {
            this.otherLanguageName = new FormControl('', [
              Validators.required,
              this.validationService.trimValidator,
              Validators.maxLength(30),
            ]);
          }

          this.personalInfoForm.addControl(
            'otherLanguageName',
            this.otherLanguageName,
          );
          this.personalInfoForm
            .get('otherLanguageName')
            .updateValueAndValidity();
          this.personalInfoForm.patchValue({
            otherLanguageName: data.other_lang,
          });
        }
      } else {
        i.selected = false;
      }
      return i;
    });
  }
  convertString(value) {
    return String(value);
  }
  setPersonalInfoForm() {
    if (this.profileMode === true) {
      this.personalInfoForm = new FormGroup({
        salute: new FormControl({ value: '', disabled: true }, []),
        chinese_name: new FormControl({ value: '', disabled: true }, []),
        english_name: new FormControl({ value: '', disabled: true }, []),
        nick_name: new FormControl({ value: '', disabled: true }, []),
        email: new FormControl('', [
          this.validationService.trimValidator,
          Validators.required,
          this.validationService.emailValidator,
        ]),
        hkid_card_no: new FormControl({ value: '', disabled: true }, []),
        dob: new FormControl({ value: '', disabled: true }, []),
        language: this.createLanguages(this.languageArray),
        caregiver_type: new FormControl({ value: '', disabled: true }, []),
        mobile_number: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(8),
          Validators.minLength(8),
          this.validationService.onlyNumber,
        ]),
        refferers_email: new FormControl({ value: '', disabled: true }, []),
        preferred_communication_language: new FormControl(
          { value: '', disabled: true },
          [],
        ),
      });
    } else {
      this.personalInfoForm = new FormGroup({
        salute: new FormControl('', [Validators.required]),
        chinese_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(30),
        ]),
        english_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(30),
          this.validationService.alphaNumericValidator,
        ]),
        nick_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(30),
          this.validationService.alphaNumericValidator,
        ]),
        email: new FormControl('', [
          this.validationService.trimValidator,
          Validators.required,
          this.validationService.emailValidator,
        ]),
        hkid_card_no: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(30),
        ]),
        dob: new FormControl('', [Validators.required]),
        language: this.createLanguages(this.languageArray),
        caregiver_type: new FormControl('', [Validators.required]),
        mobile_number: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(8),
          Validators.minLength(8),
          this.validationService.onlyNumber,
        ]),
        refferers_email: new FormControl('', [
          this.validationService.trimValidator,
          this.validationService.emailValidator,
        ]),
        preferred_communication_language: new FormControl('', [
          Validators.required,
        ]),
      });
    }
    // {value: 'Nancy', disabled: true}
  }
  createLanguages(languageInputs) {
    return this.fb.array(
      languageInputs.map(i => {
        return this.fb.group({
          name: i.name,
          selected: i.selected,
          value: i.value,
          disabled: this.profileMode,
        });
      }),
    );
  }

  showOthers() {
    this.personalInfoForm.controls.language.value.map(
      (languageChecked: any, index) => {
        if (index === 3 && languageChecked.selected === true) {
          this.showOtherLanguageOption = true;
          if (
            !this.personalInfoForm.controls.otherLanguageName &&
            this.personalInfoForm.controls.otherLanguageName === undefined
          ) {
            this.otherLanguageName = new FormControl('', [
              Validators.required,
              this.validationService.trimValidator,
              Validators.maxLength(30),
            ]);
            this.personalInfoForm.addControl(
              'otherLanguageName',
              this.otherLanguageName,
            );
            this.personalInfoForm
              .get('otherLanguageName')
              .updateValueAndValidity();
          }
        } else if (index === 3 && languageChecked.selected === false) {
          this.showOtherLanguageOption = false;
          this.personalInfoForm.removeControl('otherLanguageName');
        }
      },
    );
  }
  public addPersonalInfo() {
    if (!this.personalInfoForm.valid) {
      this.validationService.validateAllFormFields(this.personalInfoForm);
      return false;
    }

    if (this.personalInfoForm.value.dob) {
      const dateOfBirth = new Date(
        this.personalInfoForm.value.dob.year,
        this.personalInfoForm.value.dob.month - 1,
        this.personalInfoForm.value.dob.day,
      );
      const formatedDated =
        dateOfBirth.getFullYear() +
        '-' +
        ('0' + (dateOfBirth.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + dateOfBirth.getDate()).slice(-2);
      this.personalInfoForm.value.dob = formatedDated;
    } else {
      this.personalInfoForm.value.dob = '';
    }

    const languageSelected: any = [];
    this.personalInfoForm.value.language.map((language: any, index) => {
      if (language.selected === true) {
        const tempArray: any = {};
        tempArray.language = language.value;
        if (index === 3) {
          tempArray.other_lang = this.personalInfoForm.value.otherLanguageName;
        }
        languageSelected.push(tempArray);
      }
    });

    this.personalInfoForm.value.languages = languageSelected;
    this.personalInfoForm.value.registration_no = this.registeredNumber;
    let dataToSend: any = {};
    if (this.profileMode === true) {
      dataToSend = this.personalInfoObject;
      dataToSend.email = this.personalInfoForm.value.email;
      dataToSend.mobile_number = this.personalInfoForm.value.mobile_number;
      dataToSend.registration_no = this.registeredNumber;
      dataToSend.salute = this.personalInfoObject.user.salute;
      dataToSend.languages = this.personalInfoForm.value.languages;
      // dataToSend.dob = this.personalInfoObject.user.dob
      if (this.personalInfoObject.user.dob) {
        const [year, month, day] = this.personalInfoObject.user.dob.split('-');
        this.personalInfoObject.user.dob = {
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day.split(' ')[0].trim(), 10),
        };
      }
      const dateOfBirth = new Date(
        this.personalInfoObject.user.dob.year,
        this.personalInfoObject.user.dob.month - 1,
        this.personalInfoObject.user.dob.day,
      );
      const formatedDated =
        dateOfBirth.getFullYear() +
        '-' +
        ('0' + (dateOfBirth.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + dateOfBirth.getDate()).slice(-2);
      dataToSend.dob = formatedDated;
      // this.personalInfoForm.value.dob = formatedDated
      dataToSend.preferred_communication_language = this.personalInfoObject.user.preferred_communication_language;
    } else {
      dataToSend = this.personalInfoForm.value;
    }
    if (
      dataToSend.refferers_email === '' ||
      dataToSend.refferers_email === null
    ) {
      delete dataToSend.refferers_email;
    }
    this.caregiverService.addUpdateCaregiverInfo(dataToSend).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          if (
            dataToSend.english_name &&
            dataToSend.english_name !== '' &&
            dataToSend.english_name !== null
          ) {
            localStorage.setItem('englishName', dataToSend.english_name);
            this.global.englishName = dataToSend.english_name;
          }
          this.toastr.success(returnData.message);
          if (this.currentStepFromStorage > 2) {
            this.global.currentOnBoardStep = this.currentStepFromStorage;
          } else {
            this.global.currentOnBoardStep = 2;
          }
          if (this.profileMode === true) {
            localStorage.setItem('currentOnBoardingStep', '0');
            localStorage.setItem(
              'currentCaregiverType',
              dataToSend.caregiver_type,
            );
            this.router.navigate(['/caregiver/profile/work-info']);
          } else {
            localStorage.setItem('currentOnBoardingStep', '2');
            localStorage.setItem(
              'currentCaregiverType',
              this.personalInfoForm.value.caregiver_type,
            );
            this.router.navigate(['/caregiver/onboard/work-info']);
          }
        }
      },
      err => {
        if (err.status === 400) {
          this.global.errorHandling(err, this.personalInfoForm);
          this.validationService.validateAllFormFields(this.personalInfoForm);
        } else {
          console.error(err);
        }
      },
    );
  }
}
