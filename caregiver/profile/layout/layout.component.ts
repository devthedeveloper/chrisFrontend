import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutProfileComponent implements OnInit {
  id = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const urlParts: any = this.router.url.split('/');
    this.id = Number(urlParts[5]);
  }
}
