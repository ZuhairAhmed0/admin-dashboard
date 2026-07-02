import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserUseCase } from './get-current-user.use-case';
import { IUSER_REPOSITORY } from '../../../users/domain/interfaces/user.repository';
import { BadRequestException } from '@nestjs/common';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: { findById: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserUseCase,
        { provide: IUSER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get<GetCurrentUserUseCase>(GetCurrentUserUseCase);
  });

  it('should throw BadRequestException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow(BadRequestException);
  });

  it('should return user details', async () => {
    const mockUser = {
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'admin',
      status: 'active',
      avatar: 'avatar.png',
      createdAt: new Date(),
    };
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('1');
    expect(result).toEqual(mockUser);
  });
});
