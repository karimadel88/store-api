import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransferOrdersService, QuoteResult } from './transfer-orders.service.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { FeeRulesService } from './fee-rules.service.js';
import { TransferOrder, TransferOrderStatus } from './schemas/transfer-order.schema.js';
import { FeeType } from './schemas/fee-rule.schema.js';

describe('TransferOrdersService', () => {
  let service: TransferOrdersService;
  let transferMethodsService: Partial<TransferMethodsService>;
  let feeRulesService: Partial<FeeRulesService>;
  let mockOrderModel: any;

  const mockVodafone = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    name: 'Vodafone Cash',
    code: 'VODAFONE_CASH',
    enabled: true,
  };

  const mockInstapay = {
    _id: { toString: () => '507f1f77bcf86cd799439012' },
    name: 'InstaPay',
    code: 'INSTAPAY',
    enabled: true,
  };

  const mockDisabledMethod = {
    _id: { toString: () => '507f1f77bcf86cd799439013' },
    name: 'Disabled Method',
    code: 'DISABLED',
    enabled: false,
  };

  beforeEach(async () => {
    transferMethodsService = {
      findOne: jest.fn(),
    };

    feeRulesService = {
      findBestRule: jest.fn(),
    };

    // Mock Mongoose Model
    const mockSave = jest.fn();
    mockOrderModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: { toString: () => '507f1f77bcf86cd799439099' },
      save: mockSave.mockResolvedValue({
        ...data,
        _id: { toString: () => '507f1f77bcf86cd799439099' },
      }),
    }));
    mockOrderModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    });
    mockOrderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    mockOrderModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferOrdersService,
        { provide: getModelToken(TransferOrder.name), useValue: mockOrderModel },
        { provide: TransferMethodsService, useValue: transferMethodsService },
        { provide: FeeRulesService, useValue: feeRulesService },
      ],
    }).compile();

    service = module.get<TransferOrdersService>(TransferOrdersService);
  });

  describe('quote', () => {
    it('should calculate PERCENT fee correctly', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVodafone)
        .mockResolvedValueOnce(mockInstapay);

      (feeRulesService.findBestRule as jest.Mock).mockResolvedValue({
        _id: { toString: () => 'rule1' },
        feeType: FeeType.PERCENT,
        feeValue: 1.5,
        minFee: null,
        maxFee: null,
      });

      const result: QuoteResult = await service.quote({
        fromMethodId: '507f1f77bcf86cd799439011',
        toMethodId: '507f1f77bcf86cd799439012',
        amount: 1000,
      });

      expect(result.available).toBe(true);
      expect(result.fee).toBe(15); // 1000 * 1.5 / 100
      expect(result.total).toBe(1015);
    });

    it('should calculate FIXED fee correctly', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVodafone)
        .mockResolvedValueOnce(mockInstapay);

      (feeRulesService.findBestRule as jest.Mock).mockResolvedValue({
        _id: { toString: () => 'rule2' },
        feeType: FeeType.FIXED,
        feeValue: 25,
        minFee: null,
        maxFee: null,
      });

      const result = await service.quote({
        fromMethodId: '507f1f77bcf86cd799439011',
        toMethodId: '507f1f77bcf86cd799439012',
        amount: 500,
      });

      expect(result.available).toBe(true);
      expect(result.fee).toBe(25);
      expect(result.total).toBe(525);
    });

    it('should apply minFee when calculated fee is below minimum', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVodafone)
        .mockResolvedValueOnce(mockInstapay);

      (feeRulesService.findBestRule as jest.Mock).mockResolvedValue({
        _id: { toString: () => 'rule3' },
        feeType: FeeType.PERCENT,
        feeValue: 1.0,
        minFee: 10,
        maxFee: null,
      });

      const result = await service.quote({
        fromMethodId: '507f1f77bcf86cd799439011',
        toMethodId: '507f1f77bcf86cd799439012',
        amount: 100, // 1% of 100 = 1, but minFee = 10
      });

      expect(result.fee).toBe(10);
      expect(result.total).toBe(110);
    });

    it('should apply maxFee when calculated fee exceeds maximum', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVodafone)
        .mockResolvedValueOnce(mockInstapay);

      (feeRulesService.findBestRule as jest.Mock).mockResolvedValue({
        _id: { toString: () => 'rule4' },
        feeType: FeeType.PERCENT,
        feeValue: 5.0,
        minFee: null,
        maxFee: 50,
      });

      const result = await service.quote({
        fromMethodId: '507f1f77bcf86cd799439011',
        toMethodId: '507f1f77bcf86cd799439012',
        amount: 5000, // 5% of 5000 = 250, but maxFee = 50
      });

      expect(result.fee).toBe(50);
      expect(result.total).toBe(5050);
    });

    it('should return not available when no rule exists', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVodafone)
        .mockResolvedValueOnce(mockInstapay);

      (feeRulesService.findBestRule as jest.Mock).mockResolvedValue(null);

      const result = await service.quote({
        fromMethodId: '507f1f77bcf86cd799439011',
        toMethodId: '507f1f77bcf86cd799439012',
        amount: 1000,
      });

      expect(result.available).toBe(false);
      expect(result.fee).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should throw when from == to', async () => {
      await expect(
        service.quote({
          fromMethodId: '507f1f77bcf86cd799439011',
          toMethodId: '507f1f77bcf86cd799439011',
          amount: 1000,
        }),
      ).rejects.toThrow('Source and destination methods must be different');
    });

    it('should throw when method is disabled', async () => {
      (transferMethodsService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockDisabledMethod)
        .mockResolvedValueOnce(mockInstapay);

      await expect(
        service.quote({
          fromMethodId: '507f1f77bcf86cd799439013',
          toMethodId: '507f1f77bcf86cd799439012',
          amount: 1000,
        }),
      ).rejects.toThrow('is currently disabled');
    });
  });

  describe('updateStatus', () => {
    it('should allow SUBMITTED → IN_PROGRESS', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439099',
        status: TransferOrderStatus.SUBMITTED,
        orderNumber: 'TRF-TEST-001',
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockOrder),
      }).mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockOrder, status: TransferOrderStatus.IN_PROGRESS }),
      });

      const result = await service.updateStatus(
        '507f1f77bcf86cd799439099',
        TransferOrderStatus.IN_PROGRESS,
      );

      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should allow SUBMITTED → CANCELLED', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439099',
        status: TransferOrderStatus.SUBMITTED,
        orderNumber: 'TRF-TEST-002',
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockOrder),
      }).mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockOrder, status: TransferOrderStatus.CANCELLED }),
      });

      await service.updateStatus(
        '507f1f77bcf86cd799439099',
        TransferOrderStatus.CANCELLED,
      );

      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should reject COMPLETED → SUBMITTED', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439099',
        status: TransferOrderStatus.COMPLETED,
        orderNumber: 'TRF-TEST-003',
        save: jest.fn(),
      };

      mockOrderModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      await expect(
        service.updateStatus(
          '507f1f77bcf86cd799439099',
          TransferOrderStatus.SUBMITTED,
        ),
      ).rejects.toThrow('Cannot transition');
    });

    it('should reject CANCELLED → IN_PROGRESS', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439099',
        status: TransferOrderStatus.CANCELLED,
        orderNumber: 'TRF-TEST-004',
        save: jest.fn(),
      };

      mockOrderModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      await expect(
        service.updateStatus(
          '507f1f77bcf86cd799439099',
          TransferOrderStatus.IN_PROGRESS,
        ),
      ).rejects.toThrow('Cannot transition');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      mockOrderModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus(
          '507f1f77bcf86cd799439099',
          TransferOrderStatus.IN_PROGRESS,
        ),
      ).rejects.toThrow('Transfer order not found');
    });
  });
});
