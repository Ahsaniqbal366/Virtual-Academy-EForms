import { Component, OnInit } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { AuthService } from '../providers/auth.service';
import { ToastService } from 'src/app/shared/Toast.Service';
declare var $zopim: any;
declare var setupZEmbed: any;
@Component({
  selector: 'app-tech-support-dialog',
  templateUrl: './tech-support-dialog.component.html',
  styleUrls: ['./tech-support-dialog.component.scss'],
})
export class TechSupportDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TechSupportDialogComponent>, private authService: AuthService, private toast:ToastService) { }
  name:string = ''; 
  phone: string = '';
  email: string = '';
  description:string = '';
  question: string = '';
  ngOnInit() {

    
  }
  //called on cancel click
 closeDialog():void{
  this.dialogRef.close(); 
 }
 //called on submit click
 submitTicket():void{
	 //call ticket creation api method
	this.authService.createTicket(this.name, this.email, '', this.phone, this.question, this.description).subscribe((ticketResponse)=>{
		//close dialog and alert user
		this.dialogRef.close();
		// this.alertService.ShowAlert('Ticket Created', 'A ticket has been submitted to our help desk.');
    this.toast.presentToast('A ticket has been submitted to our help desk.');
	  });
 }
 	//called on chat button click
  startZopim() {
   var self = this;
   
		//try with prefilled code from zendesk widget
		try { 
			console.log('before embed');
			console.log(typeof setupZEmbed);
			setupZEmbed();
			
		}
		catch (exception) {
		
		}

			//setup interval to initialize everyting
			var zopimInitInterval = setInterval(function () {
				//if $zopim exists, lets setup on set connected
				if (typeof $zopim !== 'undefined') {

					try {
						//have to wrap calls in $zopim(function...., per documentation
						$zopim(function () {
							//on connction to zopim, we want to call the onConnectedCallBack, show window if we need to
							$zopim.livechat.setOnConnected(function () {

						
								//show window if we need to
								
									$zopim.livechat.window.show();
                  self.dialogRef.close();
							});
            });
            
						//since zopim is defined, clear this interval
						clearInterval(zopimInitInterval);
					}
					catch (exception) {
						
						clearInterval(zopimInitInterval);
					}
				}
			}, 100);
      self.dialogRef.close();
	}


}
