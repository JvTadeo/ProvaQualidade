import { Sistema } from "../models/Sistema";
import { Disciplina } from "../models/Disciplina";
import { PreRequisito } from "../models/PreRequisito";
import { Request, Response } from 'express';

export class InscricaoController {
  private sistema: Sistema;

  constructor() {
    this.sistema = new Sistema();
  }

  public async apresentarDisciplinas(req: Request, res: Response) {
    try {
      const data = await this.sistema.apresentarDadosDoBanco();
      res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao apresentar disciplinas' });
    }
  }

  public async realizarInscricao(req: Request, res: Response) {
    try {
      const { turmas, pre_requisito, prontuario } = req.body;

      const disciplinas: Disciplina[] = turmas;
      const preRequistos: PreRequisito[] = pre_requisito;

      const verificarPreRequisitos = this.sistema.verificarDisciplinas(disciplinas, preRequistos);

      if (verificarPreRequisitos.creditos !== 10000) {
        res.status(402).json({ message: 'Disciplina não pode ser inscrita pois ela possui pré-requisitos!', disciplina: verificarPreRequisitos });
        return;
      }

      const estaNaFila = await this.sistema.verificarFilaDeEspera(prontuario, disciplinas);

      if (estaNaFila) {
        res.status(400).json({ message: 'Prontuário já está na fila de espera' });
        return;
      }

      const verificarCadastroNoBanco = await this.sistema.verificarCadastroDeProntuario(prontuario);

      if (verificarCadastroNoBanco === 1) {
        res.status(400).json({ message: 'Prontuário já cadastrado!' });
        return;
      }

      const result = this.sistema.realizarInscricao(disciplinas);

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

      res.status(200).json({ message: 'Inscrição realizada com sucesso' });

      await this.sistema.cadastrarNoDb(prontuario);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao realizar inscrição - Server' });
    }
  }

  public async adicionarAFila(req: Request, res: Response) {
    try {
      const { disciplina, prontuario } = req.body;
      this.sistema.adicionarAlunoNaFilaDeEspera(disciplina, prontuario);
      res.status(200).json({ message: 'Aluno adicionado na fila de espera' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao adicionar a fila!' });
    }
  }

  public async apresentarPreRequisitos(req: Request, res: Response) {
    try {
      const data = await this.sistema.apresentarPeRequisitos();
      res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao apresentar disciplinas');
    }
  }
}
