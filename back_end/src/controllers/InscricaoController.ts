import { Sistema } from "../models/Sistema";
import { Disciplina } from "../models/Disciplina";

const sistema = new Sistema();

export const apresentarDisciplinas = async (req: any, res: any) => {
  try {
    const data = await sistema.apresentarDadosDoBanco();
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao apresentar disciplinas'); // Retorna um status 500 em caso de erro
  }
};

export const realizarInscricao = async (req: any, res: any) => {
  try {
    // Variables
    const { turmas } = req.body;    
    const disciplinas: Array<Disciplina> = [];

    for (let index = 0; index < turmas.length; index++) {
      disciplinas[index] = turmas[index]
    }

    const result = sistema.realizarInscricao(disciplinas);

    if(result.id === 2) {
      res.status(400).json({ message: 'Horário de inscrição já ocupado'});
      return;
    }
    if(result.id === 3) {
      res.status(400).json({ message: 'Créditos excedidos'});
      return;
    }

    if(result.id === 4) {
      res.status(401).json({ message: 'Espaço indisponível', disciplina: result.disciplinaReturn});      
      return;
    }

    res.status(200).json({ message: 'Inscrição realizada com sucesso'});

  } catch (error) {
    console.error(error);    
    res.status(500).json({ message: 'Erro ao realizar inscrição  - Server'});
  }
};

export const adicionarAFila = async(req: any, res: any) => {
  try {
    const { disciplina } = req.body;
    sistema.adicionarAlunoNaFilaDeEspera(disciplina);        
    res.status(200).json({ message: 'Aluno adicionado na fila de espera'});
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar a fila!'});
  }
};