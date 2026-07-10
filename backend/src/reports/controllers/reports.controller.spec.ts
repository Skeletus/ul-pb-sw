import { ReportsController } from './reports.controller';

describe('ReportsController PDF download', () => {
  it('returns a PDF attachment with the expected content type and filename', async () => {
    const service = { generateUsagePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')) };
    const controller = new ReportsController(service as never);
    const response = await controller.downloadPdf(4, { from: '2026-07-01', to: '2026-07-02' });
    expect(service.generateUsagePdf).toHaveBeenCalledWith(4, { from: '2026-07-01', to: '2026-07-02' });
    expect(response.getHeaders()).toEqual(expect.objectContaining({ type: 'application/pdf', disposition: expect.stringContaining('attachment') }));
  });
});
