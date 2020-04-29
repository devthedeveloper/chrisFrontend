import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  currentUrlSection: any = '';
  profileMode = false;
  constructor(public global: GlobalService, private router: Router) {}

  ngOnInit(): void {
    const urlParts: any = this.router.url.split('/');
    this.currentUrlSection = urlParts[2];
    if (this.currentUrlSection === 'profile') {
      this.profileMode = true;
    } else {
      this.profileMode = false;
    }
  }
}
