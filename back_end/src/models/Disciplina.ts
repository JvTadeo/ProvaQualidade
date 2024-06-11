import { Turma } from "./Turma";

export class Disciplina {
    constructor(public nome: string, public creditos: number, public turma: Turma, public pre_requisito : String){}
}