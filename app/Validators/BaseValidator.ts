export default class BaseValidator {
  public messages = {
    minLength: 'Tamanho mínimo inválido para {{ field }}',
    maxLength: 'Tamanho maximo inválido para {{ field }}',
    required: 'O campo {{ field }} é obrigatorio',
    exists: 'Não existe o {{ field }} no banco',
    unique: 'Ja existe um {{ field }} com este valor no banco',
    email: 'Este email não é valido',
  }
}
