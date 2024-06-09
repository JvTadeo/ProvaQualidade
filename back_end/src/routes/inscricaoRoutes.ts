import { Router } from 'express';
import { adicionarAFila, apresentarDisciplinas, realizarInscricao } from '../controllers/InscricaoController';

const router = Router();

router.get('/disciplinas', apresentarDisciplinas)
router.post('/realizarInscricao', realizarInscricao)
router.put('/adicionarAFila', adicionarAFila);

export default router;