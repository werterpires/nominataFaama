import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { LogonComponent } from './components/logon/logon.component'
import { ContainerComponent } from './components/shared/container/container.component'
import { StudentComponent } from './components/student/student.component'

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logon', component: LogonComponent },
  { path: '', component: ContainerComponent },
  { path: 'student/:studentid', component: StudentComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
