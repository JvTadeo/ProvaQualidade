import { Router } from 'express';
import { adicionarAFila, apresentarDisciplinas, apresentarPreRequisitos, realizarInscricao } from '../controllers/InscricaoController';

const router = Router();

router.get('/disciplinas', apresentarDisciplinas)
router.get('/pre_requisitos', apresentarPreRequisitos)
router.post('/realizarInscricao', realizarInscricao)
router.put('/adicionarAFila', adicionarAFila);

export default router;