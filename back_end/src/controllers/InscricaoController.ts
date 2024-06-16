import { Sistema } from "../models/Sistema";
import { Disciplina } from "../models/Disciplina";
import { PreRequisito } from "../models/PreRequisito";

export const apresentarDisciplinas = async (req: any, res: any) => {
  try {
    const sistema = new Sistema();
    const data = await sistema.apresentarDadosDoBanco();    
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao apresentar disciplinas'}); // Retorna um status 500 em caso de erro
  }
};

export const realizarInscricao = async (req: any, res: any) => {
  const sistema = new Sistema();
  try {
      // Variables
      const { turmas, pre_requisito, prontuario } = req.body;

      const disciplinas: Disciplina[] = [];
      const preRequistos: PreRequisito[] = [];

      for (let index = 0; index < turmas.length; index++) {
          disciplinas[index] = turmas[index];
      }

      for (let index = 0; index < pre_requisito.length; index++) {
          preRequistos[index] = pre_requisito[index];
      }

      // Verificar Pré-Requisitos
      const verificarPreRequisitos = sistema.verificarDisciplinas(disciplinas, preRequistos);

      if (verificarPreRequisitos.creditos !== 10000) {
          res.status(402).json({ message: 'Disciplina não pode ser inscrita pois ela possui pré-requisitos!', disciplina: verificarPreRequisitos });
          return;
      }

      // Verificar se está na fila de espera
      const estaNaFila = await sistema.verificarFilaDeEspera(prontuario, disciplinas);

      if (estaNaFila) {
          res.status(400).json({ message: 'Prontuário já está na fila de espera' });
          return;
      }

      // Verificar cadastro no banco
      const verificarCadastroNoBanco = await sistema.verificarCadastroDeProntuario(prontuario);

      if (verificarCadastroNoBanco === 1) {
          res.status(400).json({ message: 'Prontuário já cadastrado!' });
          return;
      }

      // Realizar inscrição
      const result = sistema.realizarInscricao(disciplinas);

      if (result.id === 2) {
          res.status(400).json({ message: 'Horário de inscrição já ocupado' });
          return;
      }
      if (result.id === 3) {
          res.status(400).json({ message: 'Créditos excedidos' });
          return;
      }
      if (result.id === 4) {
          res.status(401).json({ message: 'Espaço indisponível', disciplina: result.disciplinaReturn });
          return;
      }

      // Inscrição bem sucedida
      res.status(200).json({ message: 'Inscrição realizada com sucesso' });

      // Cadastro no banco de dados
      await sistema.cadastrarNoDb(prontuario);

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao realizar inscrição - Server' });
  }
};

export const adicionarAFila = async(req: any, res: any) => {
  const sistema = new Sistema();
  try {
    const { disciplina, prontuario } = req.body;    
    sistema.adicionarAlunoNaFilaDeEspera(disciplina, prontuario);        
    res.status(200).json({ message: 'Aluno adicionado na fila de espera'});
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar a fila!'});
  }
};

export const apresentarPreRequisitos = async (req: any, res: any) => {
  const sistema = new Sistema();
  try {
    const data = await sistema.apresentarPeRequisitos();
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao apresentar disciplinas'); // Retorna um status 500 em caso de
  }
};