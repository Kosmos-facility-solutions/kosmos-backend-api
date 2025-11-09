import { PaginatedDto } from '@common/dto/paginated.dto';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { generateTemporaryPassword } from '@libraries/util';
import { MailingService } from '@modules/email/email.service';
import { ROLES } from '@modules/role/enums/roles.enum';
import { RoleRepository } from '@modules/role/role.repository';
import { Injectable } from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private emailService: MailingService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    let user: User = null;

    await this.userRepository.executeTransaction(async (t) => {
      user = await this.userRepository.create(createUserDto, t);
      const userRole = await this.roleRepository.findByName(ROLES.USER, t);
      await user.addRole(userRole.id, t);
    });

    return UserResponseDto.fromUser(user);
  }

  async createEmployee(createUserDto: CreateUserDto) {
    let user: User = null;
    const temporaryPassword = generateTemporaryPassword();
    const employeeData = {
      ...createUserDto,
      password: temporaryPassword,
      isFirstLogin: true,
      isActive: true,
      isEmailConfirmed: false,
    };

    await this.userRepository.executeTransaction(async (t) => {
      user = await this.userRepository.create(employeeData, t);
      const employeeRole = await this.roleRepository.findByName(
        ROLES.EMPLOYEE,
        t,
      );
      await user.addRole(employeeRole.id, t);
    });

    await this.emailService.sendEmployeeWelcomeEmail(user, temporaryPassword);

    return UserResponseDto.fromUser(user);
  }
  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<User>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }) {
    const paginatedUsers = await this.userRepository.findAndCountAll(options);

    const users = UserResponseDto.fromUser(paginatedUsers.data);
    const paginatedUserResponses = { ...paginatedUsers, data: users };
    return paginatedUserResponses as PaginatedDto<UserResponseDto>;
  }

  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    const user = await this.userRepository.findOneById(id, include, attributes);
    return UserResponseDto.fromUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    return UserResponseDto.fromUser(user);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }
}
