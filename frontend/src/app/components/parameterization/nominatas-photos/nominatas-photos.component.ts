import { Component, Input } from '@angular/core'
import {
  CreateStudentPhotoDto,
  IStudentPhoto,
  UpdateStudentPhotoDto,
  receiveStudentPhoto,
} from './types'
import { NominataPhotosService } from './nominatas-photos.service'
import { IPermissions } from '../../shared/container/types'
import { INominata } from '../nominatas/types'
import { DataService } from '../../shared/shared.service.ts/data.service'

@Component({
  selector: 'app-nominatas-photos',
  templateUrl: './nominatas-photos.component.html',
  styleUrls: ['./nominatas-photos.component.css'],
})
export class NominatasPhotosComponent {
  @Input() permissions!: IPermissions
  Registry!: IStudentPhoto
  title = 'Foto da turma da Nominata'
  createRegistryData!: File
  nominataId!: number
  allNominatas: INominata[] = []

  showBox = true
  showForm = false
  isLoading = false
  done = false
  doneMessage = ''
  error = false
  errorMessage = ''
  constructor(
    private service: NominataPhotosService,
    public dataService: DataService,
  ) {}
  ngOnInit() {
    this.imageUrl = null
    this.getAllNominatas()
  }

  resetCreationRegistry() {
    Object.keys(this.createRegistryData).forEach((key) => {
      switch (typeof key) {
        case 'boolean':
          Object.defineProperty(this.createRegistryData, key, { value: false })
          break
        case 'number':
          Object.defineProperty(this.createRegistryData, key, { value: 0 })
          break
        case 'string':
          Object.defineProperty(this.createRegistryData, key, { value: '' })
          break
      }
    })
  }
  imageUrl: string | null = null

  getAllNominatas() {
    this.isLoading = true
    this.service.findAllNominatas().subscribe({
      next: (res) => {
        this.allNominatas = res.sort((a, b) => {
          if (a.year > b.year) {
            return -1
          } else if (a.year < b.year) {
            return 1
          } else {
            return 0
          }
        })
        this.nominataId = this.allNominatas[0].nominata_id
        this.getPhoto()
        this.isLoading = false
      },
      error: (err) => {
        this.errorMessage = err.message
        this.error = true
        this.isLoading = false
      },
    })
  }
  getPhoto() {
    this.isLoading = true

    this.service.findPhoto(parseInt(this.nominataId.toString())).subscribe({
      next: (res) => {
        if (res instanceof Blob) {
          const reader = new FileReader()
          reader.onload = (e: any) => {
            this.imageUrl = e.target.result
            this.isLoading = false
          }
          reader.readAsDataURL(res)
        } else {
          this.imageUrl = null
          this.showForm = true
          this.isLoading = false
        }
      },
      error: (err) => {
        if (err.status == 404) {
          this.imageUrl = null
          this.isLoading = false
        } else {
          this.errorMessage = err.message
          this.error = true
          this.isLoading = false
        }
      },
    })
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e: any) => {
      this.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
    this.createRegistryData = event.srcElement.files[0]
  }

  createRegistry() {
    this.isLoading = true

    if (this.createRegistryData) {
    }
    const formData = new FormData()
    formData.append(
      'file',
      this.createRegistryData,
      this.createRegistryData.name,
    )

    this.service
      .createRegistry(formData, parseInt(this.nominataId.toString()))
      .subscribe({
        next: (res) => {
          this.doneMessage = 'Registro criado com sucesso.'
          this.done = true
          // this.ngOnInit()
          this.isLoading = false
        },
        error: (err) => {
          this.errorMessage = err.message
          this.error = true
          this.isLoading = false
        },
      })
  }
  // editRegistry(index: number, buttonId: string) {
  //   this.isLoading = true
  //   const newRegistry: Partial<IStudentPhoto> = {
  //     ...this.allRegistries[index],
  //   }
  //   delete newRegistry.created_at
  //   delete newRegistry.updated_at
  //   this.service
  //     .updateRegistry(newRegistry as UpdateStudentPhotoDto)
  //     .subscribe({
  //       next: (res) => {
  //         this.doneMessage = 'Registro editado com sucesso.'
  //         this.done = true
  //         document.getElementById(buttonId)?.classList.add('hidden')
  //         this.isLoading = false
  //       },
  //       error: (err) => {
  //         this.errorMessage = err.message
  //         this.error = true
  //         this.isLoading = false
  //       },
  //     })
  // }
  // deleteRegistry(id: number) {
  //   this.isLoading = true
  //   this.service.deleteRegistry(id).subscribe({
  //     next: (res) => {
  //       this.doneMessage = 'Registro removido com sucesso.'
  //       this.done = true
  //       this.isLoading = false
  //       this.ngOnInit()
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Não foi possível remover o registro.'
  //       this.error = true
  //       this.isLoading = false
  //     },
  //   })
  // }
  closeError() {
    this.error = false
  }
  closeDone() {
    this.done = false
  }
}
