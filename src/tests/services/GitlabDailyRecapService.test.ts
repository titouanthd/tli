import GitlabDailyRecapService from '../../services/GitlabDailyRecapService';

describe('GitlabDailyRecapService', () => {
    describe('printDailyRecap', () => {
        it('should print daily recap', async () => {
            const status = await GitlabDailyRecapService.printDailyRecap();
            expect(status).toBe(true);
        });
    });
});
