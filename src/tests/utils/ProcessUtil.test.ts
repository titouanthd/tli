import PromiseUtil from '../../utils/PromiseUtil';

describe('PromiseUtil', () => {
    it('should sleep for 1 second', async () => {
        const start = Date.now();
        await PromiseUtil.sleep(1000);
        const end = Date.now();
        const diff = end - start;
        expect(diff).toBeGreaterThanOrEqual(1000);
    });
});
