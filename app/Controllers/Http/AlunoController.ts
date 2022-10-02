import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AlunoValidator from 'App/Validators/AlunoValidator'
import ExcelHelper from 'App/Utils/ExcelHelper'
import xlsx from 'xlsx'
import Env from '@ioc:Adonis/Core/Env'

export default class AlunoController {
  private validator: AlunoValidator
  private excelHelper: ExcelHelper

  constructor() {
    this.validator = new AlunoValidator()
    this.excelHelper = new ExcelHelper()
  }

  public async cadastrar({ request, response }: HttpContextContract) {
    try {
      const planilhaAlunos = request.file('planilha_alunos')

      if (!planilhaAlunos) {
        return response.status(404).send({ mensagem: 'Nenhum arquivo informado' })
      }

      if (planilhaAlunos.extname !== 'xlsx') {
        return response
          .status(404)
          .send({ mensagem: 'Formato de arquivo inválido, esperado: XLSX' })
      }

      await planilhaAlunos.move(Env.get('UPLOAD_PATH'), {
        name: 'planilha-alunos.xlsx',
        overwrite: true,
      })

      await this.excelHelper.retornaDadosPlanilha() //valida se os dados estao legiveis

      return response
        .status(200)
        .send({ sucesso: true, mensagem: 'Planilha processada com sucesso', dados: planilhaAlunos })
    } catch (error) {
      var fs = require('fs')
      var filePath = Env.get('UPLOAD_PATH') + 'planilha-alunos.xlsx'
      fs.unlinkSync(filePath)

      return response
        .status(500)
        .send({ sucesso: false, mensagem: 'Erro ao processar planilha', erro: error.message })
    }
  }

  public async consultar({ response }: HttpContextContract) {
    try {
      const retornoPlanilha = await this.excelHelper.retornaDadosPlanilha()

      return response.status(200).send(retornoPlanilha.dados)
    } catch (error) {
      return response
        .status(500)
        .send({ sucesso: false, mensagem: 'Erro ao consultar planilha', erro: error.message })
    }
  }

  public async apagar({ response, params }: HttpContextContract) {
    try {
      if (!params.cpf) {
        return response.status(500).send({ sucesso: false, mensagem: 'CPF é obrigatório.' })
      }
      const retornoPlanilha = await this.excelHelper.retornaDadosPlanilha()

      let qtAntes = retornoPlanilha.dados.length

      let alunos = retornoPlanilha.dados.filter(
        (aluno) => aluno.CPF.replace(/[^0-9]/g, '') !== params.cpf.replace(/[^0-9]/g, '')
      )

      if (qtAntes === alunos.length) {
        return response.status(404).send({ sucesso: false, mensagem: 'CPF não encontrado.' })
      }

      const ws = xlsx.utils.json_to_sheet(alunos)

      //Cria novo para sobrescrever
      var workBook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workBook, ws, 'Plan1', true)
      await xlsx.writeFile(workBook, './tmp/uploads/planilha-alunos.xlsx')

      return response.status(200).send(alunos)
    } catch (error) {
      return response
        .status(500)
        .send({ sucesso: false, mensagem: 'Erro ao apagar aluno', erro: error.message })
    }
  }

  public async atualizar({ request, response, params }: HttpContextContract) {
    try {
      if (!params.cpf) {
        return response.status(500).send({ sucesso: false, mensagem: 'CPF é obrigatório.' })
      }

      const payload = await request.validate(this.validator.atualizar())

      const retornoPlanilha = await this.excelHelper.retornaDadosPlanilha()

      let alunoEdicao = retornoPlanilha.dados.filter(
        (aluno) => aluno.CPF.replace(/[^0-9]/g, '') === params.cpf.replace(/[^0-9]/g, '')
      )

      if (alunoEdicao.length === 0) {
        return response.status(404).send({ sucesso: false, mensagem: 'CPF não encontrado.' })
      }

      let alunosSemEdicao = retornoPlanilha.dados.filter(
        (aluno) => aluno.CPF.replace(/[^0-9]/g, '') !== params.cpf.replace(/[^0-9]/g, '')
      )

      alunoEdicao[0]['Nome do Aluno'] = payload.nome
      alunoEdicao[0]['Estado Civil'] = payload.estado_civil
      alunoEdicao[0]['Email'] = payload.email
      alunoEdicao[0]['RG'] = payload.rg
      alunoEdicao[0]['Data de Nascimento'] = payload.dt_nascimento
      alunoEdicao[0]['Sexo'] = payload.sexo

      alunosSemEdicao.push(alunoEdicao[0])

      const ws = xlsx.utils.json_to_sheet(alunosSemEdicao)

      //Cria novo para sobrescrever
      var workBook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workBook, ws, 'Plan1', true)
      await xlsx.writeFile(workBook, './tmp/uploads/planilha-alunos.xlsx')

      let dadosPlanilhaAtualizado = await this.excelHelper.retornaDadosPlanilha()

      return response.status(200).send(dadosPlanilhaAtualizado.dados)
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ sucesso: false, mensagem: 'Erro ao editar aluno', erro: error.messages })
    }
  }
}
