import ProcessUtil from '../../../src/utils/ProcessUtil';
import fs from 'fs';

describe('ProcessUtil', () => {
    describe('isValidCsvFile', () => {
        it('should return false if the file does not exist', () => {
            const target = 'nonexistent.csv';
            expect(ProcessUtil.isValidCsvFile(target)).toBe(false);
        });

        it('should return false if the file is not a csv file', () => {
            const target = 'noncsvfile.txt';
            expect(ProcessUtil.isValidCsvFile(target)).toBe(false);
        });

        it('should return true if the file exists and is a csv file', () => {
            const target = 'valid.csv';
            expect(ProcessUtil.isValidCsvFile(target)).toBe(true);
        });

        // we also want to test bindEnvironmentVariables method
        it('should load the environment variables', () => {
            const env = 'test';
            process.env.NODE_ENV = env;
            const envFile = `.env.${env}`;
            const envFilePath = process.cwd() + '/' + envFile;
            fs.writeFileSync(envFilePath, 'TEST_ENV_VAR=123');
            ProcessUtil.bindEnvironmentVariables();
            expect(process.env.TEST_ENV_VAR).toBe('123');
            fs.unlinkSync(envFilePath);
        });
    });
});
