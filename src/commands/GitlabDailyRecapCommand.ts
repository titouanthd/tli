import AbstractCommand from '../abstract/AbstractCommand';
import { GITLAB_DAILY_RECAP } from '../globals/AppConstants';
import { Command } from 'commander';
import GitlabDailyRecapService from '../services/GitlabDailyRecapService';

export default class GitlabDailyRecapCommand extends AbstractCommand {
    constructor(command: Command) {
        super(command, GITLAB_DAILY_RECAP, 'gdr', 'Gitlab daily recap');
    }

    public async execute(): Promise<void> {
        const status = await GitlabDailyRecapService.printDailyRecap();
        if (!status) {
            console.error('An error occurred while fetching the daily recap. Exiting...');
            return;
        }

        console.log(`${this.name} executed`);
    }
}
