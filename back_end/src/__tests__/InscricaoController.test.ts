import { Request, Response } from 'express';
import { apresentarDisciplinas, realizarInscricao, adicionarAFila, apresentarPreRequisitos } from '../controllers/InscricaoController';
import { Sistema } from '../models/Sistema';
import { Disciplina } from '../models/Disciplina';
import { Turma } from '../models/Turma';

jest.mock('../models/Sistema');

describe('Inscricao Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let sistemaMock: jest.Mocked<Sistema>;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    sistemaMock = new Sistema() as jest.Mocked<Sistema>;
    (Sistema as jest.Mock).mockReturnValue(sistemaMock);
  });

  describe('Apresentar Disciplinas', () => {
    it('should return 200 and data on success', async () => {
      const mockData = { data: 'someData' };
      sistemaMock.apresentarDadosDoBanco.mockResolvedValueOnce(mockData);

      await apresentarDisciplinas(req as Request, res as Response);

      expect(sistemaMock.apresentarDadosDoBanco).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 on error', async () => {
      sistemaMock.apresentarDadosDoBanco.mockRejectedValue(new Error('some error'));

      await apresentarDisciplinas(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({message: 'Erro ao apresentar disciplinas'});
    });
  });

  describe('Realizar Inscricao', () => {
    beforeEach(() => {
      req = {
        body: {
          turmas: [
            new Disciplina('Disciplina Teste', 4, new Turma('codigo', 'professor', 'horario', 'local', 30), new String('Pre-requisito Teste'))
          ],
          pre_requisito: [
            { nome: 'Pre-requisito Teste' }
          ],
          prontuario: '12345',
        },
      };
    });

    it('should return 402 if pre-requisites are not met', async () => {
      const mockDisciplina: Disciplina = new Disciplina('Disciplina Teste', 9999, new Turma('codigo', 'professor', 'horario', 'local', 30), new String('Pre-requisito Teste'));
      sistemaMock.verificarDisciplinas.mockReturnValue(mockDisciplina);

      await realizarInscricao(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Disciplina não pode ser inscrita pois ela possui pré-requisitos!',
        disciplina: mockDisciplina,
      });
    });

    // Adicione mais testes para cobrir todos os cenários
  });

  describe('Adicionar na Fila', () => {
    beforeEach(() => {
      req = {
        body: {
          disciplina: 'disciplina1',
          prontuario: '12345',
        },
      };
    });

    it('should return 200 on success', async () => {
      await adicionarAFila(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Aluno adicionado na fila de espera' });
    });

    it('should return 500 on error', async () => {
      sistemaMock.adicionarAlunoNaFilaDeEspera.mockImplementation(() => {
        throw new Error('some error');
      });

      await adicionarAFila(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao adicionar a fila!' });
    });
  });

  describe('Apresentar Pre Requisitos', () => {
    it('should return 200 and data on success', async () => {
      const mockData = { data: 'some data' };
      sistemaMock.apresentarPeRequisitos.mockResolvedValue(mockData);

      await apresentarPreRequisitos(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 on error', async () => {
      sistemaMock.apresentarPeRequisitos.mockRejectedValue(new Error('some error'));

      await apresentarPreRequisitos(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erro ao apresentar disciplinas');
    });
  });
});
