import { Request } from "express";
import express from 'express';
import cors from 'cors';
import inscricaoRoutes from './routes/inscricaoRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.use('/api/inscricao', inscricaoRoutes); // Montando as rotas de inscrição

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});