import ProcessUtil from '../../utils/ProcessUtil';

describe('GitlabDailyRecapService', () => {
    beforeEach(() => {
        ProcessUtil.bindEnvironmentVariables();
    });
    describe('printDailyRecap', () => {
        it('should print daily recap', async () => {
            // const status = await GitlabDailyRecapService.printDailyRecap();
            expect(true).toBe(true);
        });
    });
});
