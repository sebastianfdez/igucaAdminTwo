import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss']
})
export class AdminMenuComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  logOut() {
      this.afAuth.auth.signOut().then(() => {
        this.openLogin();
      }).catch((error) => {
      });
    }

    openLogin() {
      // this.loginHolder = this.factory.resolveComponentFactory(LoginComponent);
      // this.componentHolders.push(this.parent.createComponent(this.loginHolder));
    }

    openReports() {
      this.router.navigate(['reports']);
    }

    openSurvey() {
      this.router.navigate(['survey']);
    }

    showExistingCourses() {
      this.router.navigate(['courses']);
    }

    showExistingCompanies() {
      this.router.navigate(['companies']);
    }

}
