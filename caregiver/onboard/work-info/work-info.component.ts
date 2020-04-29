import { Component, OnInit, ElementRef } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
@Component({
  selector: 'app-work-info',
  templateUrl: './work-info.component.html',
})
export class WorkInfoComponent implements OnInit {
  workInfoForm: FormGroup;
  isRnEn = true; // Will be made dynamic based on API response
  yearsOfExperience: any = '0';
  monthsOfExperience: any = '0';
  showEducationBlock = false;
  showAnotherPreviousEmployer = true;
  showAddMoreEducation = true;
  registeredNumber: any = '';
  currentCaregiverType: any = '';
  deletedEmployer: any = [];
  deletedEducation: any = [];
  showRemoveEmployer = true;
  showRemoveEducation = true;
  currentStepFromStorage: any;
  monthsArray: any = [
    {
      id: 1,
      name: 'January',
    },
    {
      id: 2,
      name: 'February',
    },
    {
      id: 3,
      name: 'March',
    },
    {
      id: 4,
      name: 'April',
    },
    {
      id: 5,
      name: 'May',
    },
    {
      id: 6,
      name: 'June',
    },
    {
      id: 7,
      name: 'July',
    },
    {
      id: 8,
      name: 'August',
    },
    {
      id: 9,
      name: 'September',
    },
    {
      id: 10,
      name: 'October',
    },
    {
      id: 11,
      name: 'November',
    },
    {
      id: 12,
      name: 'December',
    },
  ];
  years: any = [];
  educationYears: any = [];
  minDate: any = '';
  currentUrlSection: any = '';
  profileMode = false;
  constructor(
    private validationService: ValidationService,
    public global: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private caregiverService: CaregiverService,
    private elementReference: ElementRef,
  ) {
    this.registeredNumber = localStorage.getItem('registeredNumber');
    this.currentCaregiverType = localStorage.getItem('currentCaregiverType');
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

    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),
    };
    const date = new Date();
    const iterationNUmber = Number(date.getFullYear()) - 1999;
    const iterationEducationNUmber = Number(date.getFullYear()) - 1979;
    this.setWorkInfoForm();
    this.getWorkInfo();
    this.years = Array(iterationNUmber)
      .fill(1)
      .map((x, i) => i + 2000);
    this.educationYears = Array(iterationEducationNUmber)
      .fill(1)
      .map((x, i) => i + 1980);
  }
  setCurrentExperience(month, year) {
    const currentDate = new Date();
    let inputDate: any;
    inputDate = new Date(year, month - 1, 1);
    let dy = currentDate.getFullYear() - inputDate.getFullYear();
    let dm = currentDate.getMonth() - inputDate.getMonth();
    let dd = currentDate.getDate() - inputDate.getDate();
    if (dd < 0) {
      dm -= 1;
      dd += 30;
    }
    if (dm < 0) {
      dy -= 1;
      dm += 12;
    }
    this.yearsOfExperience = String(dy);
    this.monthsOfExperience = String(dm);
  }
  setPreviousEmployeeExperience(index) {
    const fromDate = new Date(
      this.workInfoForm.get('previous_employer_details')['controls'][
        index
      ].controls.from_year.value,
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.from_month.value - 1,

      1,
    );
    const toDate = new Date(
      this.workInfoForm.get('previous_employer_details')['controls'][
        index
      ].controls.to_year.value,
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.to_month.value - 1,

      1,
    );
    let dy = toDate.getFullYear() - fromDate.getFullYear();
    let dm = toDate.getMonth() - fromDate.getMonth();
    let dd = toDate.getDate() - fromDate.getDate();

    if (dd < 0) {
      dm -= 1;
      dd += 30;
    }
    if (dm < 0) {
      dy -= 1;
      dm += 12;
    }
    this.workInfoForm
      .get('previous_employer_details')
      ['controls'][index].controls.years_experience.setValue(dy);
    this.workInfoForm
      .get('previous_employer_details')
      ['controls'][index].controls.months_experience.setValue(dm);
  }
  getWorkInfo() {
    this.caregiverService.getWorkInfo(this.registeredNumber).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          returnData.data = returnData.data[0];
          if (returnData.data.employer.length === 0) {
            this.showRemoveEmployer = false;
          }
          if (returnData.data.education.length === 0) {
            this.showRemoveEducation = false;
          }
          if (returnData.data.licence_expiry_date) {
            const [
              year,
              month,
              day,
            ] = returnData.data.licence_expiry_date.split('-');
            returnData.data.licence_expiry_date = {
              year: parseInt(year, 10),
              month: parseInt(month, 10),
              day: parseInt(day.split(' ')[0].trim(), 10),
            };
          }
          const object: any = [];
          returnData.data.previous_employer_details = [];
          returnData.data.employer.map((employeerData: any) => {
            if (employeerData.is_current_employer === '1') {
              returnData.data.current_employer_hospital_name =
                employeerData.name;
              returnData.data.current_employer_work_type =
                employeerData.work_type;
              returnData.data.current_employer_month = employeerData.from_month;
              returnData.data.current_employer_year = employeerData.from_year;
              returnData.data.current_employer_id = employeerData.id;
              this.setCurrentExperience(
                returnData.data.current_employer_month,
                returnData.data.current_employer_year,
              );
            } else {
              employeerData.company_name = employeerData.name;
              object.push(employeerData);
            }
          });

          this.workInfoForm.patchValue(returnData.data);
          const previousEmployerDetails = this.workInfoForm.get(
            'previous_employer_details',
          ) as FormArray;
          object.map((previous: any, index) => {
            if (index > 0) {
              previousEmployerDetails.push(
                this.createPreviousEmployerDetails(),
              );
            }
          });
          previousEmployerDetails.patchValue(object);
          object.map((previous: any, index) => {
            this.setPreviousEmployeeExperience(index);
          });

          const educationDetails = this.workInfoForm.get(
            'education_details',
          ) as FormArray;
          returnData.data.education.map((education: any, index) => {
            if (index > 0) {
              educationDetails.push(this.createEducationDetails());
            }
          });
          educationDetails.patchValue(returnData.data.education);
        }
      },
      err => {},
    );
  }
  setWorkInfoForm() {
    if (this.profileMode === true) {
      this.workInfoForm = new FormGroup({
        show_employer_option: new FormControl(
          { value: '', disabled: true },
          [],
        ),
        current_employer_hospital_name: new FormControl(
          { value: '', disabled: true },
          [this.validationService.trimValidator, Validators.maxLength(50)],
        ),
        current_employer_work_type: new FormControl(
          { value: '', disabled: true },
          [],
        ),
        current_employer_month: new FormControl(
          { value: '', disabled: true },
          [],
        ),
        current_employer_year: new FormControl(
          { value: '', disabled: true },
          [],
        ),
        current_employer_id: new FormControl({ value: '', disabled: true }, []),
        previous_employer_details: this.formBuilder.array([
          this.createPreviousEmployerDetails(),
        ]),
        education_details: this.formBuilder.array([
          this.createEducationDetails(),
        ]),
      });
    } else {
      this.workInfoForm = new FormGroup({
        // licence_expiry_date: new FormControl('', []),
        show_employer_option: new FormControl('', [Validators.required]),
        current_employer_hospital_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        current_employer_work_type: new FormControl('', []),
        current_employer_month: new FormControl('', []),
        current_employer_year: new FormControl('', []),
        current_employer_id: new FormControl('', []),
        previous_employer_details: this.formBuilder.array([
          this.createPreviousEmployerDetails(),
        ]),
        education_details: this.formBuilder.array([
          this.createEducationDetails(),
        ]),
      });
    }

    if (
      this.currentCaregiverType === '1' ||
      this.currentCaregiverType === '2'
    ) {
      this.isRnEn = true;
      if (this.profileMode === true) {
        // Add License expiry date
        this.workInfoForm.addControl(
          'licence_expiry_date',
          new FormControl({ value: '', disabled: true }, [Validators.required]),
        );
      } else {
        // Add License expiry date
        this.workInfoForm.addControl(
          'licence_expiry_date',
          new FormControl('', [Validators.required]),
        );
      }

      this.workInfoForm.get('licence_expiry_date').updateValueAndValidity();
    } else {
      this.isRnEn = false;
    }
  }
  createEducationDetails(): FormGroup {
    if (this.profileMode === true) {
      return this.formBuilder.group({
        institute_name: new FormControl({ value: '', disabled: true }, [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        degree: new FormControl({ value: '', disabled: true }, [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        start_year: new FormControl({ value: '', disabled: true }, []),
        end_year: new FormControl({ value: '', disabled: true }, []),
        id: '',
      });
    } else {
      return this.formBuilder.group({
        institute_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        degree: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        start_year: new FormControl('', []),
        end_year: new FormControl('', []),
        id: '',
      });
    }
  }
  createPreviousEmployerDetails(): FormGroup {
    if (this.profileMode === true) {
      return this.formBuilder.group({
        company_name: new FormControl({ value: '', disabled: true }, [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        work_type: new FormControl({ value: '', disabled: true }, []),
        from_month: new FormControl({ value: '', disabled: true }, []),
        from_year: new FormControl({ value: '', disabled: true }, []),
        to_month: new FormControl({ value: '', disabled: true }, []),
        to_year: new FormControl({ value: '', disabled: true }, []),
        years_experience: '',
        months_experience: '',
        id: '',
      });
    } else {
      return this.formBuilder.group({
        company_name: new FormControl('', [
          this.validationService.trimValidator,
          Validators.maxLength(50),
        ]),
        work_type: new FormControl('', []),
        from_month: new FormControl('', []),
        from_year: new FormControl('', []),
        to_month: new FormControl('', []),
        to_year: new FormControl('', []),
        years_experience: '',
        months_experience: '',
        id: '',
      });
    }
  }
  removePreviousEmployer(index) {
    const previousEmployerDetails = this.workInfoForm.get(
      'previous_employer_details',
    ) as FormArray;
    // Add ID in deleted Employer
    this.deletedEmployer.push(
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.id.value,
    );
    // Remove from formarray
    previousEmployerDetails.removeAt(index);
  }
  removeEducation(index) {
    const educationDetails = this.workInfoForm.get(
      'education_details',
    ) as FormArray;
    // Add ID in deleted Education
    this.deletedEducation.push(
      this.workInfoForm.get('education_details')['controls'][index].controls.id
        .value,
    );
    // Remove from formarray
    educationDetails.removeAt(index);
  }
  addMoreEducation() {
    const educationDetails = this.workInfoForm.get(
      'education_details',
    ) as FormArray;
    if (educationDetails.length <= 4) {
      educationDetails.push(this.createEducationDetails());
    } else {
      this.showAddMoreEducation = false;
    }
  }
  addPreviousEmployer() {
    const previousEmployerDetails = this.workInfoForm.get(
      'previous_employer_details',
    ) as FormArray;
    if (previousEmployerDetails.length <= 4) {
      previousEmployerDetails.push(this.createPreviousEmployerDetails());
    } else {
      this.showAnotherPreviousEmployer = false;
    }
  }
  checkDateValidation(event, type, index) {
    if (
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.from_month.value &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.from_month.value !== '' &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.from_year.value &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.from_year.value !== '' &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.to_month.value &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.to_month.value !== '' &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.to_year.value &&
      this.workInfoForm.get('previous_employer_details')['controls'][index]
        .controls.to_year.value !== ''
    ) {
      const fromDate = new Date(
        this.workInfoForm.get('previous_employer_details')['controls'][
          index
        ].controls.from_year.value,
        this.workInfoForm.get('previous_employer_details')['controls'][index]
          .controls.from_month.value - 1,

        1,
      );
      const toDate = new Date(
        this.workInfoForm.get('previous_employer_details')['controls'][
          index
        ].controls.to_year.value,
        this.workInfoForm.get('previous_employer_details')['controls'][index]
          .controls.to_month.value - 1,

        1,
      );
      if (fromDate.getTime() >= toDate.getTime()) {
        this.workInfoForm
          .get('previous_employer_details')
          ['controls'][index].controls.from_month.setErrors({
            serverError: 'From date should be Smaller then To Date',
          });
      } else {
        // Calculate Experience
        let dy = toDate.getFullYear() - fromDate.getFullYear();
        let dm = toDate.getMonth() - fromDate.getMonth();
        let dd = toDate.getDate() - fromDate.getDate();

        if (dd < 0) {
          dm -= 1;
          dd += 30;
        }
        if (dm < 0) {
          dy -= 1;
          dm += 12;
        }
        this.workInfoForm
          .get('previous_employer_details')
          ['controls'][index].controls.years_experience.setValue(dy);
        this.workInfoForm
          .get('previous_employer_details')
          ['controls'][index].controls.months_experience.setValue(dm);

        this.workInfoForm
          .get('previous_employer_details')
          ['controls'][index].controls.from_month.setErrors(null);
      }
    } else {
      this.workInfoForm
        .get('previous_employer_details')
        ['controls'][index].controls.from_month.setErrors({
          serverError: 'Please select From & To Dates',
        });
    }
  }
  checkEducationDateValidation(event, index) {
    if (
      this.workInfoForm.get('education_details')['controls'][index].controls
        .institute_name.value &&
      this.workInfoForm.get('education_details')['controls'][index].controls
        .institute_name.value !== null &&
      this.workInfoForm.get('education_details')['controls'][index].controls
        .institute_name.value !== ''
    ) {
      if (
        this.workInfoForm.get('education_details')['controls'][index].controls
          .start_year.value &&
        this.workInfoForm.get('education_details')['controls'][index].controls
          .start_year.value !== '' &&
        this.workInfoForm.get('education_details')['controls'][index].controls
          .end_year.value &&
        this.workInfoForm.get('education_details')['controls'][index].controls
          .end_year.value !== ''
      ) {
        if (
          this.workInfoForm.get('education_details')['controls'][index].controls
            .end_year.value <
          this.workInfoForm.get('education_details')['controls'][index].controls
            .start_year.value
        ) {
          this.workInfoForm
            .get('education_details')
            ['controls'][index].controls.start_year.setErrors({
              serverError: 'From Year should be Smaller then To Year',
            });
        } else {
          this.workInfoForm
            .get('education_details')
            ['controls'][index].controls.start_year.setErrors(null);
        }
      } else {
        this.workInfoForm
          .get('education_details')
          ['controls'][index].controls.start_year.setErrors({
            serverError: 'Please select From & To Years',
          });
      }
    }
  }
  calculateExperience(event, type) {
    const currentDate = new Date();
    if (
      this.workInfoForm.get('current_employer_month').value &&
      this.workInfoForm.get('current_employer_month').value !== '' &&
      this.workInfoForm.get('current_employer_year').value &&
      this.workInfoForm.get('current_employer_year').value !== ''
    ) {
      let inputDate: any;
      if (type === 'year') {
        inputDate = new Date(
          event.target.value,
          this.workInfoForm.get('current_employer_month').value - 1,
          1,
        );
      } else if (type === 'month') {
        inputDate = new Date(
          this.workInfoForm.get('current_employer_year').value,
          event.target.value - 1,
          1,
        );
      }

      let dy = currentDate.getFullYear() - inputDate.getFullYear();
      let dm = currentDate.getMonth() - inputDate.getMonth();
      let dd = currentDate.getDate() - inputDate.getDate();

      if (dd < 0) {
        dm -= 1;
        dd += 30;
      }
      if (dm < 0) {
        dy -= 1;
        dm += 12;
      }
      this.yearsOfExperience = String(dy);
      this.monthsOfExperience = String(dm);
      this.workInfoForm.controls.current_employer_month.setErrors(null);
    } else {
      this.workInfoForm.controls.current_employer_month.setErrors({
        serverError: 'Please select Month & Year',
      });
    }
  }
  public addWorkInfo() {
    if (!this.workInfoForm.valid) {
      this.validationService.validateAllFormFields(this.workInfoForm);
      for (const key of Object.keys(this.workInfoForm.controls)) {
        if (this.workInfoForm.controls[key].invalid) {
          const invalidControl = this.elementReference.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]',
          );
          invalidControl.focus();
          break;
        }
      }
      return false;
    }

    if (this.workInfoForm.value.licence_expiry_date) {
      const dateOfBirth = new Date(
        this.workInfoForm.value.licence_expiry_date.year,
        this.workInfoForm.value.licence_expiry_date.month - 1,
        this.workInfoForm.value.licence_expiry_date.day,
      );
      const formatedDated =
        dateOfBirth.getFullYear() +
        '-' +
        ('0' + (dateOfBirth.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + dateOfBirth.getDate()).slice(-2);
      this.workInfoForm.value.licence_expiry_date = formatedDated;
    }
    const dataToSend: any = {};
    dataToSend.registration_no = this.registeredNumber;
    dataToSend.caregiver_type = this.currentCaregiverType;
    dataToSend.licence_expiry_date = this.workInfoForm.value.licence_expiry_date;
    dataToSend.show_employer_option = this.workInfoForm.value.show_employer_option;
    dataToSend.employer = [];
    if (
      this.workInfoForm.value.current_employer_hospital_name !== '' &&
      this.workInfoForm.value.current_employer_month !== '' &&
      this.workInfoForm.value.current_employer_work_type !== '' &&
      this.workInfoForm.value.current_employer_year !== ''
    ) {
      const currentEmployerObject: any = {};
      currentEmployerObject.is_current_employer = String(1);
      currentEmployerObject.name = this.workInfoForm.value.current_employer_hospital_name;
      currentEmployerObject.work_type = this.workInfoForm.value.current_employer_work_type;
      currentEmployerObject.from_month = this.workInfoForm.value.current_employer_month;
      currentEmployerObject.from_year = this.workInfoForm.value.current_employer_year;
      if (
        this.workInfoForm.value.current_employer_id &&
        this.workInfoForm.value.current_employer_id !== '' &&
        this.workInfoForm.value.current_employer_id !== null &&
        this.workInfoForm.value.current_employer_id > 0
      ) {
        currentEmployerObject.id = this.workInfoForm.value.current_employer_id;
      }

      // currentEmployerObject.id = this.workInfoForm.value.current_employer_id
      dataToSend.employer.push(currentEmployerObject);
    }
    this.workInfoForm.value.previous_employer_details.map(
      (previous: any, previousIndex) => {
        if (
          previous.company_name !== '' &&
          previous.from_month !== '' &&
          previous.to_month !== '' &&
          previous.from_year !== '' &&
          previous.to_year !== '' &&
          previous.work_type !== ''
        ) {
          if (previous.to_year < previous.to_year) {
            this.workInfoForm
              .get('previous_employer_details')
              ['controls'][previousIndex].controls.start_year.setErrors({
                serverError: 'Please select proper dates',
              });
          }
          const previousEmployerObject: any = {};
          previousEmployerObject.name = previous.company_name;
          previousEmployerObject.work_type = previous.work_type;
          previousEmployerObject.from_month = previous.from_month;
          previousEmployerObject.from_year = previous.from_year;
          previousEmployerObject.to_month = previous.to_month;
          previousEmployerObject.to_year = previous.to_year;
          previousEmployerObject.is_current_employer = String(0);
          if (previous.id && previous.id > 0) {
            previousEmployerObject.id = previous.id;
          }
          dataToSend.employer.push(previousEmployerObject);
        } else {
          this.workInfoForm
            .get('previous_employer_details')
            ['controls'][previousIndex].controls.from_year.setErrors({
              serverError: 'Please Fill all the fileds',
            });
        }
      },
    );
    dataToSend.deleted_employer = this.deletedEmployer;
    dataToSend.deleted_education = this.deletedEducation;
    dataToSend.education = [];
    this.workInfoForm.value.education_details.map((education: any) => {
      if (
        education.degree !== '' &&
        education.end_year !== '' &&
        education.institute_name !== '' &&
        education.start_year !== ''
      ) {
        const educationObject: any = {};
        educationObject.institute_name = education.institute_name;
        educationObject.degree = education.degree;
        educationObject.start_year = education.start_year;
        educationObject.end_year = education.end_year;
        if (education.id && education.id > 0) {
          educationObject.id = education.id;
        }

        dataToSend.education.push(educationObject);
      }
    });
    this.caregiverService.addUpdateCaregiverWorkInfo(dataToSend).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.toastr.success(returnData.message);
          if (this.currentStepFromStorage > 3) {
            this.global.currentOnBoardStep = this.currentStepFromStorage;
          } else {
            this.global.currentOnBoardStep = 3;
          }
          if (this.profileMode) {
            localStorage.setItem('currentOnBoardingStep', '0');
            this.router.navigate(['/caregiver/profile/skillset']);
          } else {
            localStorage.setItem('currentOnBoardingStep', '3');
            this.router.navigate(['/caregiver/onboard/skillset']);
          }
        }
      },
      err => {
        if (err.status === 400) {
          this.global.errorHandling(err, this.workInfoForm);
          this.validationService.validateAllFormFields(this.workInfoForm);
        } else {
          console.error(err);
        }
      },
    );
  }
}
