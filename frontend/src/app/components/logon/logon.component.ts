import { Component, EventEmitter, Output } from '@angular/core';
import { ValidateService } from '../shared/shared.service.ts/validate.services';
import { Router } from '@angular/router';
import { ILogon, ILogonDto } from './logon.Dto';
import { LogonService } from './logon.service';

@Component({
  selector: 'app-logon',
  templateUrl: './logon.component.html',
  styleUrls: ['./logon.component.css']
})
export class LogonComponent {
  constructor(private logonService:LogonService, 
  private validateService:ValidateService,
  private router: Router){};

  @Output() mailChange = new EventEmitter<string>();
  @Output() passwordChange = new EventEmitter<string>();
  
  errorMessage:string = ""
  error!: boolean

  logonData:ILogon = {
    principalEmail: "",
    passwordHash:"",
    name: "",
    cpf:"",
    rolesId:[false, false, false, false, false, false]

  }

  confirmPassword:string = ""
  confirmEmail:string = ""

  seePassword:boolean = false
  isLoading:boolean = false

  validateEmailData() {
    const emailInput = document.getElementById('emailInput') as HTMLInputElement;
    const valid = this.validateService.validateEmailData(this.logonData.principalEmail)
    this.validateService.colorInput(valid, emailInput)
    
  }
  
  validatePasswordData() {
    const passwordInput = document.getElementById('senhaInput') as HTMLInputElement;
    const valid = this.validateService.validatePasswordData(this.logonData.passwordHash)
    this.validateService.colorInput(valid, passwordInput)
  }

  validateNameData() {
    
    const nameInput = document.getElementById('nameInput') as HTMLInputElement;
    const valid = this.validateService.validateNameData(this.logonData.name)
    this.validateService.colorInput(valid, nameInput)
  }

  validateCpfData() {
    const nameInput = document.getElementById('cpfInput') as HTMLInputElement;
    const valid = this.validateService.validateCpfData(this.logonData.cpf)
    this.validateService.colorInput(valid, nameInput)
  }

  logon() {
    this.isLoading=true

    const isValidEmail = this.validateService.validateEmailData(this.logonData.principalEmail)  
    if(!isValidEmail){
      this.errorMessage = 'Digite um email válido para prosseguir com o logon'
          this.error = true
          this.isLoading = false
          return      
      }
    const isValidPass = this.validateService.validatePasswordData(this.logonData.passwordHash)
      if(!isValidPass){
        this.errorMessage = 'A senha deve conter pelo menos 8 caracteres, sendo´pelo menos uma letra minúscula, pelo menos uma letra maiúscula, pelo menos um símbolo e pelo menos um número.'
        this.error = true
        this.isLoading = false
        return
      }
    
      const isValidName = this.validateService.validateNameData(this.logonData.name)
      if(!isValidName){
        this.errorMessage = 'O nome deve conter pelo menos 2 palavras (Nome e Sobrenome) com pelo menos 2 letras em cada um.'
        this.error = true
        this.isLoading = false
        return
      }
      this.logonData.cpf = this.logonData.cpf.replace(/[^\d]/g, '');
      const isValidCpf = this.validateService.validateCpfData(this.logonData.cpf)
      if(!isValidCpf){
        this.errorMessage = 'Por favor, insira um CPF válido.'
        this.error = true
        this.isLoading = false
        return
      }

      const isConfirmedPass = this.logonData.passwordHash === this.confirmPassword
      if(!isConfirmedPass){
        this.errorMessage = 'As duas senhas digitadas não conferem.'
        this.error = true
        this.isLoading = false
        return
      }

      const isConfirmedEmail = this.logonData.principalEmail === this.confirmEmail
      if(!isConfirmedEmail){
        this.errorMessage = 'Os dois Emails digitados não conferem.'
        this.error = true
        this.isLoading = false
        return
      }
      const roles:number[] = []

      for (let i = 0; i < this.logonData.rolesId.length; i++) {
        if (this.logonData.rolesId[i]) {
          roles.push(i + 1);
        }
      }

      const isValidRoles = roles.length>0
      if(!isValidRoles){
        this.errorMessage = 'Você precisa escolher pelo menos um papel de usuário.'
        this.error = true
        this.isLoading = false
        return
      }
      

      const logonDataDto:ILogonDto = {
        name: this.logonData.name,
        cpf: this.logonData.cpf,
        principalEmail: this.logonData.principalEmail,
        passwordHash: this.logonData.passwordHash,
        rolesId: roles

      }


    this.logonService.logon(logonDataDto).subscribe({
      
      next: res => {

        localStorage.setItem("access_token", JSON.parse(JSON.stringify(res)).access_token)
        this.router.navigate(['/']);
        this.isLoading = false
      },
      error: err => {
        this.errorMessage = err.message
        this.error = true
        this.isLoading = false
      }
    });
  }

  showPassword(){
    this.seePassword = !this.seePassword

    const passwordInput = document.getElementById('senhaInput') as HTMLInputElement;
    if (this.seePassword) {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }

  closeError(){
    this.error = false
  }

  formatarCPF() {
    this.logonData.cpf = this.logonData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  confirmPasswordData(){
    const confirmPasswordInput = document.getElementById('confirmPasswordInput') as HTMLInputElement;
    const valid = this.logonData.passwordHash === this.confirmPassword
    this.validateService.colorInput(valid, confirmPasswordInput)
  }

  confirmEmailData(){
    const confirmEmailInput = document.getElementById('confirmEmailInput') as HTMLInputElement;
    const valid = this.logonData.principalEmail === this.confirmEmail
    this.validateService.colorInput(valid, confirmEmailInput)
  }


}
