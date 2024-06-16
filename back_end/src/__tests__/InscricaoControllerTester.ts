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
      it('should return 200 and data on success', async () => { // Retornar todas as Disciplinas
        const mockData = { data: 'someData' };
        this.sistemaMock.apresentarDadosDoBanco.mockResolvedValueOnce(mockData);

        await this.inscricaoController.apresentarDisciplinas(this.req as Request, this.res as Response);
        
        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.send).toHaveBeenCalledWith(mockData);
      });
      it('should return 500 on error', async () => { // Ocorreu algum erro para retornar as Disciplinas
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
                'Disciplina - FRONT END',
                50,
                new Turma('codigo', 'professor', 'horario', 'local', 30),
                new String('Pre-requisito Teste')
              ),
            ],
            pre_requisito: [{ id: 'TS', nome: 'Pre-requisito Teste' }],
            prontuario: '12345',
          },
        };
        jest.clearAllMocks();
      });
      it('should return 402 if pre-requisites are not met', async () => { // Disciplina precisa de Requisitos
        const mockDisciplina: Disciplina = new Disciplina( 'Disciplina - INSCRIÇÃO', 50, new Turma('codigo', 'professor', 'horario', 'local', 30), 'Pre-requisito Teste' );
        
        this.sistemaMock.verificarDisciplinas.mockReturnValue(mockDisciplina);

        await this.inscricaoController.realizarInscricao(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(402);
        expect(this.res.json).toHaveBeenCalledWith({
          message: 'Disciplina não pode ser inscrita pois ela possui pré-requisitos!',
          disciplina: mockDisciplina,
        });
      });
      it('should return 400 if credits sum is over 20', async() => { //Soma de créditos maior que 20        
        // Criação do Mock
        const mockDisciplinaTeste: Disciplina = new Disciplina('Disciplina - Excedida', 10000,
          { codigo: 'codigo', professor: 'professor', horario: 'horario', local: 'local', espacoDisponivel: 30 },
          ''
        );
        // Atribuindo o mockDisciplinaTeste como retorno do verificarDisciplina.
        this.sistemaMock.verificarDisciplinas.mockReturnValue(mockDisciplinaTeste);
        // Retornando o id de erro 3 e o mockDisciplina.
        this.sistemaMock.realizarInscricao.mockReturnValue({ id: 3, disciplinaReturn: mockDisciplinaTeste });
        // Realiza a inscrição
        await this.inscricaoController.realizarInscricao(this.req as Request, this.res as Response);
        // E se expera um status Code de 400 e a messagem 'Créditos Excedidos'
        expect(this.res.status).toHaveBeenCalledWith(400);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Créditos excedidos' });
      });
      it('should return 401 if maximum capacity', async () => { // Espaço disponível
        //Criação do Mock de disciplinas
        const mockDisciplinaTeste: Disciplina = new Disciplina('Disciplina - Excedida', 10000,
          { codigo: 'codigo', professor: 'professor', horario: 'horario', local: 'local', espacoDisponivel: 0 },
          ''
        );
        //Vai atribuir o mockDisciplinaTeste como um retorno do verificarDisciplinas()
        this.sistemaMock.verificarDisciplinas.mockReturnValue(mockDisciplinaTeste);
        //Vai retornar retonar o ID do erro, com o mockDisciplina
        this.sistemaMock.realizarInscricao.mockReturnValue({id:4 , disciplinaReturn: mockDisciplinaTeste});
        // Realiza a inscrição
        await this.inscricaoController.realizarInscricao(this.req as Request, this.res as Response);

        // Espera que o status Code retorne 401
        expect(this.res.status).toHaveBeenCalledWith(401);
        // E também, que ele tenha a mensagem 'Espaço Indisponivel' e retorna a disciplina que está sem espaço
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Espaço indisponível', disciplina: mockDisciplinaTeste });
      })
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

      it('should return 200 on success', async () => { // Adicionado na fila com exito

        await this.inscricaoController.adicionarAFila(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Aluno adicionado na fila de espera' });
      });

      it('should return 500 on error', async () => { // Não foi possível ser adicionado na fila
        this.sistemaMock.adicionarAlunoNaFilaDeEspera.mockImplementation(() => {
          throw new Error('some error');
        });
        await this.inscricaoController.adicionarAFila(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(500);
        expect(this.res.json).toHaveBeenCalledWith({ message: 'Erro ao adicionar a fila!' });
      });
    });
    describe('Apresentar Pre Requisitos', () => {
      it('should return 200 and data on success', async () => { // Retonar todas os Pré Requisitos
        const mockData = { data: 'some data' };
        this.sistemaMock.apresentarPeRequisitos.mockResolvedValue(mockData);

        await this.inscricaoController.apresentarPreRequisitos(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(200);
        expect(this.res.send).toHaveBeenCalledWith(mockData);
      });

      it('should return 500 on error', async () => { // Ocorreu algum erro!
        this.sistemaMock.apresentarPeRequisitos.mockRejectedValue(new Error('some error'));

        await this.inscricaoController.apresentarPreRequisitos(this.req as Request, this.res as Response);

        expect(this.res.status).toHaveBeenCalledWith(500);
        expect(this.res.send).toHaveBeenCalledWith('Erro ao apresentar disciplinas');
      });
    });
  }
}