

import { AppConfig } from "./app.config";


export function initializeApp(appConfig: AppConfig) {
    return () => appConfig.initializerConfig();
  }

export function constantsApp(appConfig: AppConfig){
    return () => appConfig.constantsConfig();
}
