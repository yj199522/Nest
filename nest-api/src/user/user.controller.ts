import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditDtoUser } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    constructor(private userService: UserService){}
    @Get('me')
    getMe(@GetUser() user: User) {
        return user;
    }

    @Patch()
    updateMe(@GetUser('id') userId: number, @Body() dto: EditDtoUser) {
        return this.userService.editUser(userId, dto);
    }
}
