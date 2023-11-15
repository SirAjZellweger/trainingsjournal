import { Injectable, inject } from '@angular/core';
import { Auth, user, GoogleAuthProvider, signInWithPopup, UserCredential, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Auth as FirebaseAuth } from 'firebase/auth';
import { NEVER, Observable, ReplaySubject, filter, from, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  public user$ = user(this.auth as FirebaseAuth);

  // public user$ = new ReplaySubject<User | null>(1);

  // Sign in with Google
  public signInWithGoogle(): Observable<UserCredential> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  // Sign out
  public signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  public signInWithEmailAndPassword(email: string | null, password: string | null ): Observable<UserCredential> {
    if (email && password) {
      return from(signInWithEmailAndPassword(this.auth, email, password));
    } else {
      return NEVER;
    }
  }

  public createUserWithEmailAndPassword(email: string | null, password: string | null ): Observable<UserCredential> {
    if (email && password) {
      return from(createUserWithEmailAndPassword(this.auth, email, password));
    } else {
      return NEVER;
    }
  }
}