import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        bail: 1,
        verbose: true,
        preset: 'ts-jest',
        testEnvironment: 'node',
        openHandlesTimeout: 2000,
    };
};
