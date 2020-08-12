import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import * as firebase from 'firebase';
import { Upload } from './upload'
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }

  private basePath:string = '/uploads';
  uploads: AngularFireList<Upload[]>;
  public data : any[];

  pushUpload(upload: Upload) {
    let storageRef = firebase.storage().ref();
    let uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}`).put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) =>  {
        // upload in progress
        upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      },
      (error) => {
        // upload failed
        console.log(error)
      },
      () => {
        // upload success
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
          upload.url=downloadURL
          console.log('uploadUrl', upload.url);
        });
        // upload.url = uploadTask.snapshot.downloadURL
        upload.name = upload.file.name
      
      }
    );
   
  }

  

  setData(data :any){
    this.data = data;
    console.log(this.data)
  }

  getData(){
    let temp = this.data;
    console.log(this.data)
    // this.clearData();
    console.log(temp)
    return temp;
  }

  clearData(){
    this.data = undefined;
  }

  // Writes the file details to the realtime db

}
