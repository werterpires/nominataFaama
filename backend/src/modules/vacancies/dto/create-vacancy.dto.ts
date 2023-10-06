import { IsNumber } from 'class-validator';

export class CreateVacancyDto {}

export class CreateDirectVacancyDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  field_id: number;
}
