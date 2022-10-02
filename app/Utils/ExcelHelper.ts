import xlsx from 'xlsx'
import Env from '@ioc:Adonis/Core/Env'

export default class ExcelHelper {
  public async retornaDadosPlanilha() {
    try {
      const planilha = xlsx.readFile(Env.get('UPLOAD_PATH') + 'planilha-alunos.xlsx')

      let dados = Array()
      const abas = planilha.SheetNames

      for (let i = 0; i < abas.length; i++) {
        const temp = xlsx.utils.sheet_to_json(planilha.Sheets[planilha.SheetNames[i]])

        temp.forEach((res) => {
          dados.push(res)
        })
      }

      if (dados[0].__EMPTY) {
        throw new Error('Planilha em formato invalido')
      }

      return { sucesso: true, mensagem: 'Dados lidos com sucesso', dados: dados }
    } catch (error) {
      console.log(error)
      throw new Error('Planilha em formato invalido')
    }
  }
}
