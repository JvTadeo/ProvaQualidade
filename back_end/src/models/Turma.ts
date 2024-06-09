import { Disciplina } from "./Disciplina";

export class Turma{
    constructor(
        public codigo: string,
        public professor: string, 
        public horario: string, 
        public local: string,
        public espacoDisponivel: number,
    ) {}
}