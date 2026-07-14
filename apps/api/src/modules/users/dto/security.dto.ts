import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class SecurityQuestionItemDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class SetSecurityQuestionsDto {
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionItemDto)
  questions!: SecurityQuestionItemDto[];
}

export class SetRecoveryKeyDto {
  @IsString()
  @MinLength(8)
  recoveryKey!: string;
}
