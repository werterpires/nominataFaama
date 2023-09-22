import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import {
  CreateEndowmentDto,
  IEndowment,
  UpdateEndowmentDto,
} from '../endowments/types'

@Injectable({
  providedIn: 'root',
})
export class SpEndowmentsService {
  constructor(private http: HttpClient) {}

  findAllRegistries(): Observable<IEndowment[]> {
    const token = localStorage.getItem('access_token')
    const head_obj = new HttpHeaders().set('Authorization', 'bearer ' + token)
    return this.http
      .get<IEndowment[]>(environment.API + '/endowments/person/spouse', {
        headers: head_obj,
      })
      .pipe(
        catchError((error) => {
          console.log('Veja o erro completo', error)
          return throwError(
            () =>
              new Error(
                'Não foi possível encontrar as investiduras cadastradas.',
              ),
          )
        }),
      )
  }

  createRegistry(newRegistry: CreateEndowmentDto): Observable<IEndowment> {
    const token = localStorage.getItem('access_token')
    const head_obj = new HttpHeaders().set('Authorization', 'bearer ' + token)
    return this.http
      .post<IEndowment>(environment.API + '/endowments/spouse', newRegistry, {
        headers: head_obj,
      })
      .pipe(
        catchError((error) => {
          console.log('Veja o erro completo', error)
          return throwError(
            () => new Error('Não foi possível criar a investidura.'),
          )
        }),
      )
  }

  updateRegistry(
    updatedRegistry: UpdateEndowmentDto,
  ): Observable<UpdateEndowmentDto> {
    const token = localStorage.getItem('access_token')
    const head_obj = new HttpHeaders().set('Authorization', 'bearer ' + token)
    return this.http
      .put<UpdateEndowmentDto>(
        environment.API + '/endowments',
        updatedRegistry,
        { headers: head_obj },
      )
      .pipe(
        catchError((error) => {
          console.log('Veja o erro completo', error)
          if (error.error.message == 'Registro já aprovado') {
            return throwError(
              () =>
                new Error(
                  'Não é possível atualizar ou deletar um item ja aprovado (com coloração verde).',
                ),
            )
          }
          return throwError(
            () => new Error('Não foi possível atualizar a investidura.'),
          )
        }),
      )
  }

  deleteRegistry(registryId: number): Observable<string> {
    const token = localStorage.getItem('access_token')
    const headers = new HttpHeaders().set('Authorization', `bearer ${token}`)
    return this.http
      .delete<string>(environment.API + `/endowments/${registryId}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.log('Veja o erro completo', error)
          if (error.error.message == 'Registro já aprovado') {
            return throwError(
              () =>
                new Error(
                  'Não é possível atualizar ou deletar um item ja aprovado (com coloração verde).',
                ),
            )
          }
          return throwError(
            () => new Error('Não foi possível deletar a investidura.'),
          )
        }),
      )
  }
}
