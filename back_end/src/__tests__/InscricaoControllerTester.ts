import { Request, Response } from 'express';
import { Sistema } from '../models/Sistema';
import { Disciplina } from '../models/Disciplina';
import { Turma } from '../models/Turma';
import { InscricaoController } from '../controllers/InscricaoController';

jest.mock('../models/Sistema');

export class InscricaoControllerTest {
  private req: Partial<Request>;
  private res: Partial<Response>;
  private sistemaMock: jest.Mocked<Sistema>;
  private inscricaoController : InscricaoController

  constructor() {
    this.req = {};
    this.res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    this.sistemaMock = new Sistema() as jest.Mocked<Sistema>;
    (Sistema as jest.Mock).mockReturnValue(this.sistemaMock);
    this.inscricaoController = new InscricaoController();
  }

  async runTests() {
    describe('Apresentar Disciplinas', () => {
      it('should return 200 and data on success', async () => {
        const mockData = { data: 'someData' };
        this.sistemaMock.apresentarDadosDoBanco.mockResolvedValueOnce(mockData);

        await this.inscricaoController.apresentarDisciplinas(this.req as Request, this.res as Response);
        
        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.send).toHaveBeenCalledWith(mockData);
      });

      it('should return 500 on error', async () => {
        this.sistemaMock.apresentarDadosDoBanco.mockRejectedValue(new Error('some error'));
        await this.inscricaoController.apresentarDisciplinas(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(500);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Erro ao apresentar disciplinas' });
      });
    });
    describe('Realizar Inscricao', () => {
      beforeEach(() => {
        this.req = {
          body: {
            turmas: [
              new Disciplina(
                'Disciplina Teste',
                4,
                new Turma('codigo', 'professor', 'horario', 'local', 30),
                new String('Pre-requisito Teste')
              ),
            ],
            pre_requisito: [{ nome: 'Pre-requisito Teste' }],
            prontuario: '12345',
          },
        };
      });

      it('should return 402 if pre-requisites are not met', async () => {
        const mockDisciplina: Disciplina = new Disciplina(
          'Disciplina Teste',
          9999,
          new Turma('codigo', 'professor', 'horario', 'local', 30),
          new String('Pre-requisito Teste')
        );
        this.sistemaMock.verificarDisciplinas.mockReturnValue(mockDisciplina);

        await this.inscricaoController.realizarInscricao(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(402);
        expect(this.res.json).toHaveBeenCalledWith({
          message: 'Disciplina não pode ser inscrita pois ela possui pré-requisitos!',
          disciplina: mockDisciplina,
        });
      });

      // Adicione mais testes para cobrir todos os cenários
    });
    describe('Adicionar na Fila', () => {
      beforeEach(() => {
        this.req = {
          body: {
            disciplina: 'disciplina1',
            prontuario: '12345',
          },
        };
      });

      it('should return 200 on success', async () => {

        await this.inscricaoController.adicionarAFila(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Aluno adicionado na fila de espera' });
      });

      it('should return 500 on error', async () => {
        this.sistemaMock.adicionarAlunoNaFilaDeEspera.mockImplementation(() => {
          throw new Error('some error');
        });
        await this.inscricaoController.adicionarAFila(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(500);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Erro ao adicionar a fila!' });
      });
    });
    describe('Apresentar Pre Requisitos', () => {
      it('should return 200 and data on success', async () => {
        const mockData = { data: 'some data' };
        this.sistemaMock.apresentarPeRequisitos.mockResolvedValue(mockData);

        await this.inscricaoController.apresentarPreRequisitos(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.send).toHaveBeenCalledWith(mockData);
      });

      it('should return 500 on error', async () => {
        this.sistemaMock.apresentarPeRequisitos.mockRejectedValue(new Error('some error'));

        await this.inscricaoController.apresentarPreRequisitos(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(500);
        expect(this.res.send).toHaveBeenCalledWith('Erro ao apresentar disciplinas');
      });
    });
  }
}