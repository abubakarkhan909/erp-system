import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ForgotQuestionsDto {
  @IsString()
  @IsNotEmpty()
  username!: string;
}

class AnswerItemDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class ResetWithAnswersDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ResetWithRecoveryKeyDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  recoveryKey!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
