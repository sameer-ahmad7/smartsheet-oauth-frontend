import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  constructor(private userService: UserService,public popoverController: PopoverController) { }

  ngOnInit() {}

  logout(){
    this.userService.logout();
    this.popoverController.dismiss();
  }


}
