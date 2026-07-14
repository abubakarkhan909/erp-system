import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
