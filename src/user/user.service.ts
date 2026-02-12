import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import {
  ConsumptionRecord,
  ConsumptionRecordDocument,
} from '../interview/schemas/consumption-record.schema';
import {
  UserConsumption,
  UserConsumptionDocument,
} from './schemas/consumption-record.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(ConsumptionRecord.name)
    private consumptionRecordModel: Model<ConsumptionRecordDocument>,
    private consumptionModel: Model<UserConsumptionDocument>,
    private jwtService: JwtService,
  ) { }
  


  async register(registerDto: RegisterDto) { 
    const { username, email, password } = registerDto
    
    // 检查用户名是否已存在
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已被注册')
    }

    // 创建新用户
    // 密码加密会在Schema的pre钩子中自动进行
    const newUser = new this.userModel({
      username,
      email,
      password,
    })

    await newUser.save()

    // 返回用户信息（不包含密码）
    const result = newUser.toObject()
    delete result.password
    return result
  }

  async login(loginDto: LoginDto) { 
    const { email, password } = loginDto

    // 1. 找用户
    const user = await this.userModel.findOne({ email })
    if(!user) {
      throw new UnauthorizedException('用户不存在')
    }
    
    // 2. 验证密码
    const isPasswordValid = await user.comparePassword(password)
    if(!isPasswordValid) {
      throw new UnauthorizedException('邮箱或者密码不正确')
    }

    // 3. 生成token
    const token = this.jwtService.sign({
      userId: user._id,
      username: user.username,
      email: user.email,
    })

    // 4. 返回token和用户信息
    const userInfo = user.toObject()
    delete userInfo.password // 不返回密码

    return {
      token,
      user: userInfo,
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string) { 
    const user = await this.userModel.findById(userId).lean()
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    // 不返回密码
    delete user.password
    return user
  }

    async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // 如果更新邮箱，检查邮箱是否已被使用
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: userId }, // 排除当前用户
      });

      if (existingUser) {
        throw new BadRequestException('邮箱已被使用');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    delete user.password;
    return user;
  }

  /**
   * 创建消费记录
   */
  async createConsumptionRecord(
    userId: string,
    type: string,
    quantity: number = 1,
    source: string = 'free',
    relatedId?: string,
  ) {
    const record = new this.consumptionModel({
      userId,
      type,
      quantity,
      source,
      relatedId,
    });

    return await record.save();
  }

    /**
   * 获取用户消费记录
   * @param userId - 用户的唯一标识
   * @param options - 可选的查询参数，包括跳过的记录数和限制的记录数
   * @returns - 返回用户的消费记录和消费统计数据
   */
  async getUserConsumptionRecords(
    userId: string, // 用户的唯一标识，用于查询该用户的消费记录
    options: { skip?: number; limit?: number } = {}, // 可选的查询参数，包括跳过的记录数和限制的记录数
  ) {
    // 如果没有传递查询选项，默认跳过0条记录，限制返回20条记录
    const skip = options.skip || 0;
    const limit = options.limit || 20;

    // 查询消费记录，按创建时间顺序降序排列，并应用分页参数
    const records = await this.consumptionRecordModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 统计用户各类型的消费信息，使用MongoDB的聚合管道
    const stats = await this.consumptionRecordModel.aggregate([
      { $match: { userId } }, // 只统计指定用户的记录
      {
        $group:{
          _id: '$type', // 按消费类型分组
          count: { $sum: 1 }, // 计算每种类型的消费总次数
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },// 计算成功的消费次数
          },
          failedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] },// 计算失败的消费次数
          },
          totalCost: { $sum: '$estimateCost' }, // 计算总消费次数
        }
      }
    ])

    // 返回消费记录和统计数据
    return {
      records,
      stats,
    };
  }

}
