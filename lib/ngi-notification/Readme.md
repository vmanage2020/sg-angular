## NgiNotificationModule


Step 1: import module `NgiNotificationModule`

Step 2: add `constructor(private notification: NgiNotificationService){}`

## For Confirmation: 

add in ` this.notification.isConfirmation("11",{},"Are","welcome","question-circle","Yes","No","customclass").then((data)=>{
      console.log(data);

    },(err) => { console.log(err); })`

## For Notification: 

Add in `  this.notification.isNotification(true, "Create Project", "You have created! Success", "check-square");`  

#Note: - `check-square` is font awesome icon class

## check-square, check-circle, times-circle, exclamation-triangle, exclamation-circle 