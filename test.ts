import { UserRepository } from '@app/modules/hubspot/app/repositories/user.repository'
import { AuthGateway } from '@app/modules/integration/app/gateway/auth.gateway'
import { MailGateway } from '@app/modules/integration/app/gateway/mail.gateway'
import { Email } from '@app/modules/register/domain/entity/email'
import { Phone } from '@app/modules/register/domain/entity/phone.entity'
import type { CreateAssignorUserDto } from '@app/modules/register/infra/http/dtos/create-assignor-user.dto'
import { PeopleToCompanyToRolesRepository } from '@app/modules/roles/app/repositories/people-to-company-to-roles.repository'
import { RoleRepository } from '@app/modules/roles/app/repositories/role.repository'
import type { ILogMessage } from '@app/shared/app/logger/logger-shared.interface'
import { LoggerShared } from '@app/shared/app/logger/logger-shared.interface'
import { LogMessage } from '@app/shared/constants/log-message.constant'
import { faker } from '@faker-js/faker/locale/af_ZA'
import { Injectable } from '@nestjs/common'
import { PeopleToCompanyRelationType } from '@register/app/enums/people-to-company-relation-type.enum'
import { AccountsRepository } from '@register/app/repositories/accounts.repository'
import { CompaniesRepository } from '@register/app/repositories/companies.repository'
import { CompaniesToMinibanksRepository } from '@register/app/repositories/companies-to-minibanks.repository'
import { CompanyToCompanyRepository } from '@register/app/repositories/company-to-company.repository'
import { CompanyToCompanyRelationTypeRepository } from '@register/app/repositories/company-to-company-relation-type.repository'
import { DocumentToCompanyRepository } from '@register/app/repositories/document-to-company.repository'
import { DocumentToPeopleRepository } from '@register/app/repositories/document-to-people.repository'
import { DocumentTypesRepository } from '@register/app/repositories/document-types.repository'
import { DocumentsRepository } from '@register/app/repositories/documents.repository'
import { EmailToPeopleRepository } from '@register/app/repositories/email-to-people.repository'
import { EmailsRepository } from '@register/app/repositories/emails.repository'
import { PeopleToCompanyRepository } from '@register/app/repositories/people-to-company.repository'
import { PeopleToCompanyRelationTypesRepository } from '@register/app/repositories/people-to-company-relation-types.repository'
import { PeoplesRepository } from '@register/app/repositories/peoples.repository'
import { PhonesRepository } from '@register/app/repositories/phones.repository'
import { PhonesToPeoplesRepository } from '@register/app/repositories/phones-to-peoples.repository'
import { hash } from 'bcrypt'

@Injectable()
export class CreateAssignorUserUseCase {
  constructor(
    private readonly emailsRepository: EmailsRepository,
    private readonly emailToPeopleRepository: EmailToPeopleRepository,
    private readonly documentsRepository: DocumentsRepository,
    private readonly documentToPeopleRepository: DocumentToPeopleRepository,
    private readonly documentTypesRepository: DocumentTypesRepository,
    private readonly phonesRepository: PhonesRepository,
    private readonly phonesToPeoplesRepository: PhonesToPeoplesRepository,
    private readonly peoplesRepository: PeoplesRepository,
    private readonly roleRepository: RoleRepository,
    private readonly companiesToMinibanksRepository: CompaniesToMinibanksRepository,
    private readonly peopleToCompanyRelationTypesRepository: PeopleToCompanyRelationTypesRepository,
    private readonly peopleToCompanyRepository: PeopleToCompanyRepository,
    private readonly peopleToCompanyToRolesRepository: PeopleToCompanyToRolesRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly documentToCompanyRepository: DocumentToCompanyRepository,
    private readonly companyToCompanyRepository: CompanyToCompanyRepository,
    private readonly companyToCompanyRelationTypeRepository: CompanyToCompanyRelationTypeRepository,
    private readonly accountsRepository: AccountsRepository,
    private readonly usersRepository: UserRepository,
    private readonly authGateway: AuthGateway,
    private readonly mailGateway: MailGateway,
    private readonly logger: LoggerShared,
  ) {}

  private readonly logConfigs: ILogMessage = {
    module: LogMessage.MODULE_REGISTER,
    file: this.constructor.name,
  }

  async execute(minibankId: number, payload: CreateAssignorUserDto) {
    try {
      this.logger.info({
        ...this.logConfigs,
        method: 'execute',
        message: 'Create assignor user',
        debug: { minibankId, payload },
      })

      const [email, document] = await Promise.all([
        this.emailsRepository.findByData(payload.email),
        this.documentsRepository.findByData(payload.document),
      ])

      const cpfDocumentType = await this.documentTypesRepository.findByName(
        'CPF',
      )
      const role = await this.roleRepository.findByName('Cedente')
      const companyToMinibank =
        await this.companiesToMinibanksRepository.findByMinibankId({
          minibankId,
        })

      let person = null

      if (email) {
        const emailToPeople = await this.emailToPeopleRepository.findByEmailId(
          email.id,
        )
        person = await this.peoplesRepository.findById(emailToPeople.personId)
      } else if (document) {
        const documentToPeople =
          await this.documentToPeopleRepository.findByDocumentId(document.id)
        person = await this.peoplesRepository.findById(
          documentToPeople.personId,
        )
      }

      if (!person) {
        this.logger.info({
          ...this.logConfigs,
          method: 'execute',
          message: 'User not found on register schema',
          debug: { minibankId, payload },
        })

        return { roleId: role.id, companyId: companyToMinibank.companyId }
      }

      if (!email) {
        const createdEmail = await this.emailsRepository.create(
          new Email({
            data: payload.email,
          }),
        )

        await this.emailToPeopleRepository.create({
          emailId: createdEmail.id,
          personId: person.id,
        })
      }

      if (!document) {
        const createdDocument = await this.documentsRepository.create({
          data: payload.document,
          typeId: cpfDocumentType.id,
        })

        await this.documentToPeopleRepository.create({
          documentId: createdDocument.id,
          personId: person.id,
        })
      }

      const phoneToPeople = await this.phonesToPeoplesRepository.findByPeopleId(
        person.id,
      )

      if (!phoneToPeople) {
        const createdPhone = await this.phonesRepository.create(
          new Phone({
            data: payload.phone,
          }),
        )

        await this.phonesToPeoplesRepository.create({
          phoneId: createdPhone.id,
          peopleId: person.id,
        })
      }

      if (payload.isPJ) {
        const legalAgentCompanyRelationType =
          await this.peopleToCompanyRelationTypesRepository.findByName(
            PeopleToCompanyRelationType.LEGAL_AGENT,
          )
        let cnpjInUse = await this.documentsRepository.findByData(payload.cnpj)

        const cnpjDocumentType = await this.documentTypesRepository.findByName(
          'CNPJ',
        )

        if (!cnpjInUse) {
          cnpjInUse = await this.documentsRepository.create({
            data: payload.cnpj,
            typeId: cnpjDocumentType.id,
          })

          const company = await this.companiesRepository.create({
            businessName: payload.businessName,
            fantasyName: payload.fantasyName,
          })

          await this.documentToCompanyRepository.create({
            documentId: cnpjInUse.id,
            companyId: company.id,
          })

          await this.peopleToCompanyRepository.create({
            personId: person.id,
            companyId: company.id,
            relationTypeId: legalAgentCompanyRelationType.id,
          })

          const companyToCompanyRelationType =
            await this.companyToCompanyRelationTypeRepository.find({
              name: 'ASSIGNOR',
            })

          await this.companyToCompanyRepository.create({
            firstCompanyId: company.id,
            secondCompanyId: companyToMinibank.companyId,
            relationTypeId: companyToCompanyRelationType.id,
          })
        }
      } else {
        const cedenteCompanyRelationType =
          await this.peopleToCompanyRelationTypesRepository.findByName(
            PeopleToCompanyRelationType.CEDENTE_USER,
          )

        await this.peopleToCompanyRepository.findOrCreate({
          personId: person.id,
          companyId: companyToMinibank.companyId,
          relationTypeId: cedenteCompanyRelationType.id,
        })
      }

      const account = await this.accountsRepository.findByPeopleId(person.id)

      if (!account) {
        const userPassword = payload.password || faker.internet.password()
        const hashedPassword = await hash(userPassword, 12)

        await this.accountsRepository.create({
          password: hashedPassword,
          personId: person.id,
        })

        const user = await this.usersRepository.insert({
          email: payload.email,
          password: hashedPassword,
          firstName: payload.name,
          fone: payload.phone,
          minibancoId: minibankId,
          cargo: '',
          isAdmin: false,
        })

        await this.authGateway.createAuthUser({
          userId: user.id,
          email: user.email,
          name: user.firstName,
          password: userPassword,
        })

        const resetPasswordUrl =
          await this.authGateway.createChangePasswordTicket(user.email)

        await this.mailGateway.sendVerificationEmail({
          email: user.email,
          name: user.firstName,
          resetPasswordUrl,
        })
      }

      const companyRelationType =
        await this.peopleToCompanyRelationTypesRepository.findByName(
          PeopleToCompanyRelationType.MINIBANK_USER,
        )

      let peopleToCompany =
        await this.peopleToCompanyRepository.findByPersonIdAndRelationType(
          person.id,
          companyRelationType.id,
        )

      if (!peopleToCompany) {
        peopleToCompany = await this.peopleToCompanyRepository.create({
          companyId: companyToMinibank.companyId,
          personId: person.id,
          relationTypeId: companyRelationType.id,
        })
      }

      const peopleToCompanyToRole =
        await this.peopleToCompanyToRolesRepository.findByData({
          peopleToCompanyId: peopleToCompany.id,
          roleId: role.id,
        })

      if (peopleToCompanyToRole) {
        return
      }

      await this.peopleToCompanyToRolesRepository.insert({
        peopleToCompanyId: peopleToCompany.id,
        roleId: role.id,
      })
    } catch (error) {
      this.logger.error({
        ...this.logConfigs,
        method: 'execute',
        message: 'Error creating an assignor',
        debug: error,
      })

      throw error
    }
  }
}
