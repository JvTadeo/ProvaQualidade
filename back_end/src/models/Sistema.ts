import { Disciplina } from "./Disciplina";
import { PreRequisito } from "./PreRequisito";
import { Turma } from "./Turma";

export class Sistema {
    /*
    0 - Error
    1 - Sucesso
    2 - Choque de Horario
    3 - Créditos > 20
    4 - Espaço Indisponivel
    */

    public realizarInscricao(disciplina: Array<Disciplina>): { id: number, disciplinaReturn: Disciplina } {

        let disciplinaVazia : Disciplina = new Disciplina('', 0, new Turma('', '', '', '', 0), '');

        try {
            const disciplinasEscolhidas: Array<Disciplina> = this.instanciarObjetos(disciplina);            

            if (this.verificarChoqueDeHorario(disciplinasEscolhidas)) return { id: 2, disciplinaReturn: disciplinaVazia };
            if (this.verificarQuantidadeCreditos(disciplinasEscolhidas)) return { id: 3, disciplinaReturn: disciplinaVazia };

            const disciplinaSemEspaco = this.existeEspacoIndisponivel(disciplinasEscolhidas);
            if (disciplinaSemEspaco) {                
                return { id: 4, disciplinaReturn: disciplinaSemEspaco };
            }

            return { id: 1, disciplinaReturn: disciplinaVazia }

        } catch (error) {
            console.error(error)
            return { id: 0, disciplinaReturn: disciplinaVazia }
        }
    }

    public async apresentarDadosDoBanco(): Promise<any> {
        try {
            const response = await fetch("http://localhost:3001/disciplinas");

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const data = await response.json();
            return data

        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    public async apresentarPeRequisitos(): Promise<any>{
        try {
            const response = await fetch("http://localhost:3001/materias_anteriores");

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            return data;
        }
        catch (error){
            console.error(error);
            throw error;
        }
    }

    public async cadastrarNoDb(prontuario : string): Promise<any>{
        try {
            const response = await fetch('http://localhost:3001/cadastros_realizados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: prontuario
                })
            })

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async verificarFilaDeEspera(prontuario: string, disciplina : Array<Disciplina>): Promise<any>{
        try {

            const disciplinaEscolhidas : Array<Disciplina> = this.instanciarObjetos(disciplina);

            const response = await fetch("http://localhost:3001/lista_de_espera");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            let numberToBreak : Number = 0;

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < disciplinaEscolhidas.length; j++) {
                    if(data[i].id == prontuario && data[i].idDaTurnma == disciplinaEscolhidas[j].turma.codigo){ 
                        numberToBreak = 1;
                        break;
                    }
                }
                if(numberToBreak == 1) break;
            }

            return numberToBreak;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }        

    public async adicionarAlunoNaFilaDeEspera(disciplina: Disciplina, prontuario: String): Promise<Number> {        
        
        try {            
            const response = await fetch("http://localhost:3001/lista_de_espera", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: prontuario,
                    nomeDisciplina: disciplina.nome,
                    idDaTurnma: disciplina.turma.codigo,
                })
            });
    
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            
            }            
            return 1;
        } catch (error) {
            console.error('Erro ao adicionar aluno na fila de espera:', error);
            return 0;
        }
    }
    
    public async verificarCadastroDeProntuario(prontuario: string): Promise<Number> {
        try {
            const response = await fetch("http://localhost:3001/cadastros_realizados");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i].id == prontuario) {
                    return 1;
                }
            }
            return 0;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public verificarDisciplinas(disciplina : Array<Disciplina>, preRequisito: Array<PreRequisito>) : Disciplina {
        const disciplinaEscolhidas: Array<Disciplina> = this.instanciarObjetos(disciplina);

        let disciplinaVazia: Disciplina = new Disciplina('', 10000, new Turma('', '', '', '', 0), '');
    
        for (let i = 0; i < disciplinaEscolhidas.length; i++) {
            // Pular a verificação se pre_requisito estiver vazio
            if (!disciplinaEscolhidas[i].pre_requisito) {
                continue;
            }
    
            let preRequisitoAtendido = false;
    
            for (let j = 0; j < preRequisito.length; j++) {
                // console.log(`Comparando ${disciplinaEscolhidas[i].nome}, com seu pré-requisito ${disciplinaEscolhidas[i].pre_requisito} - ${preRequisito[j].id}`);
                if (disciplinaEscolhidas[i].pre_requisito === preRequisito[j].id) {
                    preRequisitoAtendido = true;
                    break;
                }
            }
    
            if (!preRequisitoAtendido) {
                return disciplinaEscolhidas[i];
            }
        }
    
        return disciplinaVazia; // Retorna disciplina vazia se todos os pré-requisitos forem atendidos
    }    

    public existeEspacoIndisponivel(disciplina: Array<Disciplina>): Disciplina | null {
        for (let i = 0; i < disciplina.length; i++) {
            if (disciplina[i].turma.espacoDisponivel === 0) {
                return disciplina[i]; // Retorna a disciplina sem espaço disponível
            }
        }
        return null; // Retorna null se nenhuma disciplina estiver sem espaço disponível
    }

    private verificarChoqueDeHorario(disciplina: Array<Disciplina>): boolean {        

        let choqueDeHorario : boolean = false;

        for (let i = 0; i < disciplina.length; i++) {
            for (let j = 0; j < disciplina.length; j++) {                
                if (i!== j) {
                    if (disciplina[i].turma.horario === disciplina[j].turma.horario) {
                        choqueDeHorario = true;
                        // console.log('Há choque de horário!')
                    }else{
                        // console.log('Não há choque de horário!')
                    }
                }
            }
            if(choqueDeHorario) break;
        }

        return choqueDeHorario;
    }

    private instanciarObjetos(objeto: Array<any>): Array<Disciplina> {
        const disciplinas: Array<Disciplina> = [];
        for (let index = 0; index < objeto.length; index++) {
            const disciplina = new Disciplina(objeto[index].nome_disciplina, objeto[index].creditos, new Turma(objeto[index].codigo, objeto[index].professor, objeto[index].horario, objeto[index].local, objeto[index].espaco_disponivel), objeto[index].pre_requisito);
            disciplinas.push(disciplina);
        }
        return disciplinas;
    }

    public verificarQuantidadeCreditos(disciplina: Array<Disciplina>): boolean {
        let creditos : number = 0
        for (let index = 0; index < disciplina.length; index++) {
            creditos += disciplina[index].creditos
        }
        
        if(creditos > 20){
            // console.log('Quantidade de créditos excedida!')
            return true
        }else{
            // console.log('Quantidade de créditos permitida!')
            return false
        }
    }
}