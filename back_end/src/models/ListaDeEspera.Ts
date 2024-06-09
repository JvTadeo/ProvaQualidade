import { Aluno } from './Aluno';

export class ListaDeEspera{
    private lista: Aluno[] = [];

    public adicionarAluno(aluno: Aluno){
        this.lista.push(aluno);    
    }
}