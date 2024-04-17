import fs from 'fs';
import dotenv from 'dotenv';

export default class ProcessUtil {
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
