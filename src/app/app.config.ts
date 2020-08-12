import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


/**
 * This AppConfig service is when the application initailizing all basic configuration loading like APPINITAILIZER
 * config.{{environment}}.ts located in src folder
 * initializerConfig and constantsConfig
 */

@Injectable()
export class AppConfig {
    static settings;
    static constants;

    constructor(private http: HttpClient) {

    }


    // Basic configuration set to AppConfig.settings
    async initializerConfig() {
        // AppConfig.settings to access whole application its depends on
        // envrionment base || Production || Development || deployment
        const configURL = `assets/config.${environment.ENVNAME}.json`
        // console.log(configURL,"configURL")
        return await this.http.get(configURL).toPromise().then(data => {
            AppConfig.settings = data;
        });
    }

    // Basic constants set to AppConfig.constants
    async constantsConfig() {
        // AppConfig.constants to access whole application its depends on
        // envrionment base || Production || Development || deployment
        const constantsURL = `assets/constants.${environment.ENVNAME}.json`
        return await this.http.get(constantsURL).toPromise().then(data => {
            AppConfig.constants = data;

        })
    }
}
