import { GetAllUsersUseCase } from './get-all-user.use-case';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { FilterUserDto } from '../../presentation/dto/filter-user.dto';
import { Role } from '../../../shared/enums/Role';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;

  beforeEach(() => {
    useCase = new GetAllUsersUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should fetch all users without filters if no filter is provided', async () => {
    const mockUsers = [{ id: '1' }, { id: '2' }] as any;
    mockUserRepo.findAll.mockResolvedValue(mockUsers);

    const result = await useCase.execute();

    expect(result).toEqual(mockUsers);
    expect(mockUserRepo.findAll).toHaveBeenCalledWith({});
  });

  it('should pass correct query to repository when filters are provided', async () => {
    const filter: FilterUserDto = { role: Role.ADMIN, name: 'Zuhair' };
    mockUserRepo.findAll.mockResolvedValue([]);

    await useCase.execute(filter);

    expect(mockUserRepo.findAll).toHaveBeenCalledWith({
      role: Role.ADMIN,
      name: 'Zuhair',
    });
  });
});
