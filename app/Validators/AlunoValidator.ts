import { schema, rules } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class AlunoValidator extends BaseValidator {
  constructor() {
    super()
  }

  public apagar() {
    const postSchema = schema.create({
      cpf: schema.string({}, [rules.minLength(11), rules.maxLength(15)]),
    })

    return { schema: postSchema, messages: this.messages }
  }

  public atualizar() {
    const postSchema = schema.create({
      nome: schema.string({}, [rules.minLength(5)]),
      estado_civil: schema.string.optional(),
      email: schema.string.optional(),
      rg: schema.string.optional(),
      dt_nascimento: schema.string.optional(),
      sexo: schema.string.optional(),
    })
    return { schema: postSchema, messages: this.messages }
  }
}
