import { Request, Response } from 'express';
import { apresentarDisciplinas, realizarInscricao, adicionarAFila, apresentarPreRequisitos } from '../src/controllers/InscricaoController';
import { Sistema } from '../src/models/Sistema';
import { Disciplina } from '../src/models/Disciplina';
import { PreRequisito } from '../src/models/PreRequisito';
import { Turma } from '../src/models/Turma';

jest.mock('../src/models/Sistema');

describe('InscricaoController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let sistemaMock: jest.Mocked<Sistema>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    sistemaMock = new Sistema() as jest.Mocked<Sistema>;
    (Sistema as jest.Mock).mockReturnValue(sistemaMock);
  });

  describe('apresentarDisciplinas', () => {
    it('should return 200 and data on success', async () => {
      const mockData = { data: 'some data' };
      sistemaMock.apresentarDadosDoBanco.mockResolvedValue(mockData);

      await apresentarDisciplinas(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 on error', async () => {
      sistemaMock.apresentarDadosDoBanco.mockRejectedValue(new Error('some error'));

      await apresentarDisciplinas(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erro ao apresentar disciplinas');
    });
  });

  describe('realizarInscricao', () => {
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

  describe('adicionarAFila', () => {
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

  describe('apresentarPreRequisitos', () => {
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
