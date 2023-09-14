import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, ReplaySubject, filter, from, map, take, tap } from 'rxjs';
import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user$ = new ReplaySubject<User | null>(1);

  constructor(private afAuth: AngularFireAuth) {}

  // Sign in with Google
  public signInWithGoogle(): Observable<User> {
    return from(this.afAuth.signInWithPopup(new GoogleAuthProvider())).pipe(
      take(1),
      map(u => ({id: u.user?.uid, email: u.user?.email, emailVerified: u.user?.emailVerified})),
      tap(u => this.user$.next(u))
    );
  }

  // Sign out
  public signOut(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      tap(() => this.user$.next(null))
    );
  }
}