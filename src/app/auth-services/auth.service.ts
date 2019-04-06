import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

    authStateUser: firebase.User = null;

    constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) {
        this.afAuth.authState.subscribe((user) => {
            if (user) {
                this.authStateUser = user;
            } else {
                localStorage.setItem('user', null);
            }
        });
    }

    get authenticated(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return this.authStateUser ? true : user ? true : false;
    }

    get currentUserObservable(): any {
        return this.afAuth.auth;
    }
}
