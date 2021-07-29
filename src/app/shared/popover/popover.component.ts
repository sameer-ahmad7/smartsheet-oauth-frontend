import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    public popoverController: PopoverController
  ) {}

  ngOnInit() {}

  logout() {
    this.userService.logout();
    this.popoverController.dismiss();
  }

  profile() {
    this.router.navigate(['/profile']);
    this.popoverController.dismiss();
  }
}
