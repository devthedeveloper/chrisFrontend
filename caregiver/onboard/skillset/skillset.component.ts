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
  selector: 'app-skillset',
  templateUrl: './skillset.component.html',
})
export class SkillsetComponent implements OnInit {
  skillSetForm: FormGroup;
  fb = new FormBuilder();
  currentCaregiverType: any = '';
  personalCareArray: any = [];
  specialCareArray: any = [];
  registeredNumber: any = '';
  currentUrlSection: any = '';
  profileMode = false;
  currentStepFromStorage: any;
  constructor(
    private validationService: ValidationService,
    public global: GlobalService,
    private router: Router,
    private caregiverService: CaregiverService,
    private toastr: ToastrService,
  ) {
    this.currentCaregiverType = localStorage.getItem('currentCaregiverType');
    this.registeredNumber = localStorage.getItem('registeredNumber');
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
  }

  async ngOnInit() {
    this.setSkillSetForm();
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
    await this.getSkills();
  }
  getSkillSet() {
    this.caregiverService.getSkillSet(this.registeredNumber).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          const personalCareFromResponse: any = [];
          const specialCareFromResponse: any = [];
          this.skillSetForm.patchValue(returnData.data[0]);
          returnData.data[0].skills.map((skills: any) => {
            if (skills.type === '1') {
              personalCareFromResponse.push(skills);
            } else if (skills.type === '2') {
              specialCareFromResponse.push(skills);
            }
          });
          this.skillSetForm.patchValue({
            personal_care: this.prefillPersonalCareSelection(
              this.skillSetForm.get('personal_care').value,
              personalCareFromResponse,
            ),
            special_care: this.prefillSpecialCareSelection(
              this.skillSetForm.get('special_care').value,
              specialCareFromResponse,
            ),
          });
        }
      },
      err => {
        console.error(err);
      },
    );
  }
  prefillSpecialCareSelection(specialCare, selectedSkills) {
    return specialCare.map(i => {
      const data = selectedSkills.filter(
        x => Number(x.id) === Number(i.value),
      )[0];
      if (data) {
        i.selected = true;
      } else {
        i.selected = false;
      }
      return i;
    });
  }
  prefillPersonalCareSelection(personalCare, selectedSkills) {
    return personalCare.map(i => {
      const data = selectedSkills.filter(
        x => Number(x.id) === Number(i.value),
      )[0];
      if (data) {
        i.selected = true;
      } else {
        i.selected = false;
      }
      return i;
    });
  }
  async getSkills() {
    const returnData: any = await this.caregiverService
      .getSkills(this.currentCaregiverType)
      .toPromise();

    if (returnData.success === true) {
      if (returnData.data.length > 0) {
        returnData.data.map((care: any) => {
          if (care.type === '1') {
            this.personalCareArray.push(care);
          } else if (care.type === '2') {
            this.specialCareArray.push(care);
          }
        });
      } else {
        this.personalCareArray = [];
        this.specialCareArray = [];
      }
    } else {
      this.personalCareArray = [];
      this.specialCareArray = [];
    }
    if (this.personalCareArray.length > 0) {
      this.skillSetForm.setControl(
        'personal_care',
        this.createPersonalCare(this.personalCareArray),
      );
    }
    if (this.specialCareArray.length > 0) {
      this.skillSetForm.setControl(
        'special_care',
        this.createSpecialCare(this.specialCareArray),
      );
    }
  }
  setSkillSetForm() {
    this.skillSetForm = new FormGroup({
      self_introduction: new FormControl('', [
        this.validationService.trimValidator,
        this.validationService.wordCountValidator,
      ]),
      skills: new FormControl('', []),
      special_care: new FormArray([]),
      personal_care: new FormArray([]),
    });

    setTimeout(() => {
      this.getSkillSet();
    }, 1000);
  }
  createSpecialCare(specialCareInput) {
    if (specialCareInput.length > 0) {
      return this.fb.array(
        specialCareInput.map(i => {
          return this.fb.group({
            name: i.english_title,
            selected: false,
            value: i.id,
          });
        }),
      );
    }
  }
  createPersonalCare(personalCareInput) {
    if (personalCareInput.length > 0) {
      return this.fb.array(
        personalCareInput.map(i => {
          return this.fb.group({
            name: i.english_title,
            selected: false,
            value: i.id,
          });
        }),
      );
    }
  }
  public addSkillSet() {
    if (!this.skillSetForm.valid) {
      this.validationService.validateAllFormFields(this.skillSetForm);
      return false;
    }
    this.skillSetForm.value.skills = [];
    this.skillSetForm.value.personal_care.map((personal: any, index) => {
      if (personal.selected === true) {
        const tempArray: any = {};
        tempArray.language = personal.value;
        this.skillSetForm.value.skills.push(personal.value);
      }
    });
    this.skillSetForm.value.special_care.map((special: any, index) => {
      if (special.selected === true) {
        const tempArray: any = {};
        tempArray.language = special.value;
        this.skillSetForm.value.skills.push(special.value);
      }
    });
    if (this.skillSetForm.value.skills.length === 0) {
      this.toastr.error('Please select at least one Skill');
      return false;
    }
    this.skillSetForm.value.registration_no = this.registeredNumber;
    delete this.skillSetForm.value.personal_care;
    delete this.skillSetForm.value.special_care;
    this.caregiverService.addUpdateSkillSet(this.skillSetForm.value).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.toastr.success(returnData.message);
          localStorage.setItem('currentOnBoardingStep', '4');
          if (this.currentStepFromStorage > 4) {
            this.global.currentOnBoardStep = this.currentStepFromStorage;
          } else {
            this.global.currentOnBoardStep = 4;
          }
          if (this.profileMode === true) {
            localStorage.setItem('currentOnBoardingStep', '0');
          }
          this.router.navigate([
            `/caregiver/${this.currentUrlSection}/availability`,
          ]);
        }
      },
      err => {
        if (err.status === 400) {
          this.global.errorHandling(err, this.skillSetForm);
          this.validationService.validateAllFormFields(this.skillSetForm);
        } else {
          console.error(err);
        }
      },
    );
  }
}
