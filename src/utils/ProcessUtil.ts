import FolderManagerService from '../services/FolderManagerService';
import fs from 'fs';
import dotenv from 'dotenv';

export default class ProcessUtil {
    public static isValidCsvFile(target: string) {
        if (!FolderManagerService.fileExists(target)) {
            console.log(`File ${target} does not exist`);
            return false;
        }

        if (!target.endsWith('.csv')) {
            console.log(`File ${target} is not a csv file`);
            return false;
        }

        return true;
    }

    public static bindEnvironmentVariables(): void {
        let env;
        if (process.env.NODE_ENV !== undefined) {
            env = process.env.NODE_ENV;
        } else {
            // by default, we are in production
            env = 'prod';
            process.env.NODE_ENV = env;
        }

        const envFile = `.env.${env}`;
        const envFilePath = process.cwd() + '/' + envFile;
        if (!fs.existsSync(envFilePath)) {
            console.error(`Environment file ${envFile} not found`);
            process.exit(1);
        }
        dotenv.config({
            path: envFile,
        });
    }
}
