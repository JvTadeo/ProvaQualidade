import { Aluno } from "./Aluno";
import { Turma } from "./Turma";

export class Inscricao{
    constructor(public aluno: Aluno, public turma: Turma) {}
}