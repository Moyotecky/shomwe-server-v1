
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../core/decorators/current-user.decorator'; // Need to create

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@CurrentUser() user: any) {
        return this.usersService.findById(user.userId);
    }
}
