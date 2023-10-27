import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import {
  ICreateProfessionalExperience,
  IProfessionalExperience,
  IUpdateProfessionalExperience,
} from '../types/types';
import { NotificationsService } from 'src/shared/notifications/services/notifications.service';
import { UserFromJwt } from 'src/shared/auth/types/types';

@Injectable()
export class ProfessionalExperiencesModel {
  @InjectModel() private readonly knex: Knex;
  constructor(private notificationsService: NotificationsService) {}

  async createProfessionalExperience(
    createExperienceData: ICreateProfessionalExperience,
    currentUser: UserFromJwt
  ): Promise<boolean> {
    try {
      const {
        job,
        job_institution,
        job_begin_date,
        job_end_date,
        person_id,
        experience_approved,
      } = createExperienceData;

      await this.knex('professional_experiences')
        .insert({
          job,
          job_institution,
          job_begin_date,
          job_end_date,
          person_id,
          experience_approved,
        })
        .returning('experience_id');

      const person = await this.knex('people')
        .where('people.person_id', person_id)
        .select('people.name')
        .first();

      await this.notificationsService.createNotification({
        action: 'inseriu',
        agent_name: currentUser.name,
        agentUserId: currentUser.user_id,
        newData: {
          trabalho: createExperienceData.job,
          instituicao: createExperienceData.job_institution,
          data_inicio: await this.notificationsService.formatDate(
            createExperienceData.job_begin_date
          ),
          data_conclusao: await this.notificationsService.formatDate(
            createExperienceData.job_end_date
          ),
          pessoa: person?.name,
        },
        notificationType: 4,
        objectUserId: currentUser.user_id,
        oldData: null,
        table: 'Experiências profissionais',
      });

      return true;
    } catch (error) {
      console.error(error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Professional experience already exists');
      } else {
        throw new Error(error.sqlMessage);
      }
    }
  }

  async findProfessionalExperienceById(
    id: number
  ): Promise<IProfessionalExperience | null> {
    let experience: IProfessionalExperience | null = null;
    let sentError: Error | null = null;

    await this.knex.transaction(async (trx) => {
      try {
        const result = await trx
          .table('professional_experiences')
          .where('experience_id', '=', id)
          .first();

        if (!result) {
          throw new Error('Professional experience not found');
        }

        experience = {
          experience_id: result.experience_id,
          job: result.job,
          job_institution: result.job_institution,
          job_begin_date: result.job_begin_date,
          job_end_date: result.job_end_date,
          person_id: result.person_id,
          experience_approved: result.experience_approved,
          created_at: result.created_at,
          updated_at: result.updated_at,
        };

        await trx.commit();
      } catch (error) {
        console.error(error);
        sentError = new Error(error.message);
        await trx.rollback();
        throw error;
      }
    });

    if (sentError) {
      throw sentError;
    }

    return experience;
  }

  async findProfessionalExperiencesByPersonId(
    personId: number
  ): Promise<IProfessionalExperience[]> {
    let experienceList: IProfessionalExperience[] = [];
    let sentError: Error | null = null;

    await this.knex.transaction(async (trx) => {
      try {
        experienceList = await trx
          .table('professional_experiences')
          .where('person_id', '=', personId)
          .select('*');

        await trx.commit();
      } catch (error) {
        console.error(error);
        sentError = new Error(error.sqlMessage);
        await trx.rollback();
      }
    });

    if (sentError) {
      throw sentError;
    }

    return experienceList;
  }

  async findApprovedProfessionalExperiencesByPersonId(
    personId: number
  ): Promise<IProfessionalExperience[]> {
    let experienceList: IProfessionalExperience[] = [];
    let sentError: Error | null = null;

    await this.knex.transaction(async (trx) => {
      try {
        experienceList = await trx
          .table('professional_experiences')
          .where('person_id', '=', personId)
          .andWhere('experience_approved', '=', true)
          .select('*');

        await trx.commit();
      } catch (error) {
        console.error(error);
        sentError = new Error(error.sqlMessage);
        await trx.rollback();
      }
    });

    if (sentError) {
      throw sentError;
    }

    return experienceList;
  }

  async findAllProfessionalExperiences(): Promise<IProfessionalExperience[]> {
    let experienceList: IProfessionalExperience[] = [];
    let sentError: Error | null = null;

    await this.knex.transaction(async (trx) => {
      try {
        experienceList = await trx
          .table('professional_experiences')
          .select('*');

        await trx.commit();
      } catch (error) {
        console.error(error);
        sentError = new Error(error.sqlMessage);
        await trx.rollback();
      }
    });

    if (sentError) {
      throw sentError;
    }

    return experienceList;
  }

  async findAllNotApprovedPersonIds(): Promise<{ person_id: number }[] | null> {
    let personIds: { person_id: number }[] | null = null;
    let sentError: Error | null = null;

    try {
      const studentResult = await this.knex
        .table('professional_experiences')
        .join('users', 'users.person_id', 'professional_experiences.person_id')
        .select('users.person_id')
        .whereNull('experience_approved');

      const spouseResult = await this.knex
        .table('professional_experiences')
        .join(
          'spouses',
          'spouses.person_id',
          'professional_experiences.person_id'
        )
        .join('students', 'students.student_id', 'spouses.student_id')
        .select('students.person_id')
        .whereNull('professional_experiences.experience_approved');

      personIds = [...studentResult, ...spouseResult].map((row) => ({
        person_id: row.person_id,
      }));
    } catch (error) {
      console.error('Erro capturado na model: ', error);
      sentError = new Error(error.message);
    }

    return personIds;
  }

  async updateProfessionalExperienceById(
    updateExperience: IUpdateProfessionalExperience
  ): Promise<IProfessionalExperience> {
    let updatedExperience: IProfessionalExperience | null = null;
    let sentError: Error | null = null;
    await this.knex.transaction(async (trx) => {
      try {
        const {
          experience_id,
          job,
          job_institution,
          job_begin_date,
          job_end_date,
          person_id,
          experience_approved,
        } = updateExperience;

        let approved = await trx('professional_experiences')
          .first('experience_approved')
          .where('experience_id', experience_id);

        if (approved.experience_approved == true) {
          throw new Error('Registro já aprovado');
        }

        await trx('professional_experiences')
          .where('experience_id', experience_id)
          .update({
            job,
            job_institution,
            job_begin_date,
            job_end_date,
            person_id,
            experience_approved,
          });

        await trx.commit();

        updatedExperience = await this.findProfessionalExperienceById(
          experience_id
        );
      } catch (error) {
        await trx.rollback();
        sentError = new Error(error.message);
      }
    });

    if (sentError) {
      throw sentError;
    }

    return updatedExperience!;
  }

  async deleteProfessionalExperienceById(id: number): Promise<string> {
    let sentError: Error | null = null;
    let message: string = '';

    await this.knex.transaction(async (trx) => {
      try {
        const existingExperience = await trx('professional_experiences')
          .select('experience_id')
          .where('experience_id', id)
          .first();

        if (!existingExperience) {
          throw new Error('Professional experience not found');
        }

        let approved = await trx('professional_experiences')
          .first('experience_approved')
          .where('experience_id', id);

        if (approved.experience_approved == true) {
          throw new Error('Registro já aprovado');
        }

        await trx('professional_experiences').where('experience_id', id).del();

        await trx.commit();
      } catch (error) {
        console.error(error);
        await trx.rollback();
        sentError = new Error(error.message);
      }
    });

    if (sentError) {
      throw sentError;
    }

    message = 'Professional experience deleted successfully.';
    return message;
  }
}
