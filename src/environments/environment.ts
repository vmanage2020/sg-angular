// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// api: "http://13.229.116.53:3000/",
// api: "http://13.250.46.60:3000/",
// api: "http://localhost:3000/",
  
export const environment = { 
  api: "http://13.250.46.60:3000/",
  ENVNAME: "dev",
  HOST:"https://us-central1-sports-gravy-app.cloudfunctions.net",
  production: false,
    firebaseConfig : {
      apiKey: "AIzaSyARc-T5WcgqEKAX1qQ17NCtv_gHNyNW8fs",
      authDomain: "sportsgravy-testing.firebaseapp.com",
      databaseURL: "https://sportsgravy-testing.firebaseio.com",
      projectId: "sportsgravy-testing",
      storageBucket: "sportsgravy-testing.appspot.com",
      messagingSenderId: "999126685452",
      appId: "1:999126685452:web:05f0c3b7a54b651d325b29",
      measurementId: "G-6NRYSCHXGJ"
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
