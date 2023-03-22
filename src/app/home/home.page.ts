import { Component } from '@angular/core';
import { AuthService } from '../signin/providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  loading:boolean = true;
  constructor(private authService: AuthService, private router:Router) {}
  ngOnInit(){
    //validate jwtToken here. this will check if it exists, then check server to make sure its valid
    this.authService.JWTIsValid().subscribe(isValid => {
      if(!isValid){
        this.router.navigate(['/signin']);
      }
      else{
        //TODO Call home page init functions here
      }
    });
  }
  /**
   * Signout user
   */
  signOut():void{
    this.authService.signout();
  }
}
