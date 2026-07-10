import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ValidateResetTokenDto } from '../dto/validate-reset-token.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

type AuthenticatedRequest = Request & {
  user: { id: number; sessionId: number };
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Session closed' })
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user.sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current authenticated user' })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.id);
  }

  @Post('change-password') @UseGuards(JwtAuthGuard) changePassword(@Req() request: AuthenticatedRequest, @Body() dto: ChangePasswordDto) { return this.authService.changePassword(request.user.id, dto.currentPassword, dto.newPassword, request.user.sessionId); }
  @UseGuards(JwtAuthGuard) @Patch('me')
  updateProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) { return this.authService.updateProfile(request.user.id, dto); }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Get('reset-password/validate')
  validateResetToken(@Query() query: ValidateResetTokenDto) {
    return this.authService.validatePasswordResetToken(query.token);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
