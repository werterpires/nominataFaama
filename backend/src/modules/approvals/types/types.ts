import { IAcademicFormation } from 'src/modules/info/academic-formations/types/types'
import { ICourse } from 'src/modules/info/courses/types/types'
import { ILanguage } from 'src/modules/info/languages/types/types'
import { ISpouse } from 'src/modules/spouses/types/types'
import { IStudent } from 'src/modules/students/types/types'
import { IUser } from 'src/modules/users/bz_types/types'

export interface ICompleteStudent {
  student: IStudent | null
  spouse: ISpouse | null
  academicFormations: IAcademicFormation[] | null
  spAcademicFormations: IAcademicFormation[] | null
  languages: ILanguage[] | null
  spLanguages: ILanguage[] | null
  courses: ICourse[] | null
  spCourses: ICourse[] | null
}

export interface ICompleteUser extends IUser {
  photo?: { file: Buffer; headers: Record<string, string> } | null
}
