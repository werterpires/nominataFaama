import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { LogonComponent } from './components/logon/logon.component'
import { StudentComponent } from './components/student/student.component'
import { NominataComponent } from './components/nominata/nominata.component'
import { RecordsComponent } from './components/records/records.component'
import { UsersApprovesComponent } from './components/approves/users-approves/users-approves.component'
import { StudentToApproveComponent } from './components/approvals/student-to-approve/student-to-approve.component'

const routes: Routes = [
  { path: 'student/:studentid', component: StudentComponent },
  { path: 'approve/students', component: StudentToApproveComponent },
  { path: 'approve/users', component: UsersApprovesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logon', component: LogonComponent },
  { path: 'nominata', component: NominataComponent },
  { path: 'cadastros', component: RecordsComponent },
  { path: '', component: NominataComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
