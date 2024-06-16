import { Router, Request, Response } from 'express';
import { InscricaoController } from '../controllers/InscricaoController';

export class InscricaoRouter {
    private router: Router;
    private inscricaoController: InscricaoController;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
        this.inscricaoController = new InscricaoController();
    }

    private initializeRoutes() {
        this.router.get('/disciplinas', (req: Request, res: Response) => this.inscricaoController.apresentarDisciplinas(req, res));
        this.router.get('/pre_requisitos', (req: Request, res: Response) => this.inscricaoController.apresentarPreRequisitos(req, res));
        this.router.post('/realizarInscricao', (req: Request, res: Response) => this.inscricaoController.realizarInscricao(req, res));
        this.router.put('/adicionarAFila', (req: Request, res: Response) => this.inscricaoController.adicionarAFila(req, res));
    }

    public getRouter(): Router {
        return this.router;
    }
}
