import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public igucaLogo = '../../../assets/Logoconfondoblanco.jpg';
  public userInput = '';
  public passwordInput = '';

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  login() {
    if (this.userInput === '' && this.passwordInput === '') {
      return;
    }
    this.afAuth.auth.signInWithEmailAndPassword(this.userInput, this.passwordInput).then(
      (value: auth.UserCredential) => {
        console.log('Success', value);
        localStorage.setItem('user', JSON.stringify({email: value.user.email}));
        this.router.navigate(['/admin']);
      }, (error) => {
        console.log('Error', error);
      }
    );
  }

}
