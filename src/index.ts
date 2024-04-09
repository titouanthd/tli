#! /usr/bin/env node

import { Command } from 'commander';

import GitlabDailyRecapCommand from './commands/GitlabDailyRecapCommand';
import ProcessUtil from './utils/ProcessUtil';

// force the process to be in the root directory
process.chdir(__dirname + '/..');

console.log(`Loading environment variables...`);
ProcessUtil.bindEnvironmentVariables();
console.log(`Environment loaded`);

const APP_VERSION = process.env.APP_VERSION;
const APP_NAME = process.env.APP_NAME;
if (!APP_VERSION || !APP_NAME) {
    console.error('APP_VERSION or/and APP_NAME is/are not defined');
    process.exit(1);
} else {
    console.log(`Starting ${APP_NAME} v${APP_VERSION}`);
}

const commander = new Command();
commander.version(APP_VERSION, '-v, --version').name(APP_NAME).description('CLI to control the tscrapper application').parse(process.argv);

const commands = [GitlabDailyRecapCommand];

commands.forEach((Command) => new Command(commander));
commander.parse(process.argv);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
