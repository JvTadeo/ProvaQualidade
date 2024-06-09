<template>
    <div style="width: 50%; background-color: white; border-radius: 12px;">
        <div
            style="display: flex; flex-direction: column; margin: 10px 12px; justify-content: center; align-items: center;">
            <div style="display: flex; width: 100%; align-items: flex-start; flex-direction: column; margin-bottom: 12px;">
                <p style="font-weight: 600; font-size: 32px; margin-bottom: 12px;">SISTEMA ACADÊMICO</p>
                <p>Olá! Preencha todas as informações para se inscrever!</p>
            </div>
            <Divider />
            <div style="width: 80%; height: 100%; display: flex; flex-direction: column; margin-top: 20px; align-items: center;"
                v-show="!loading">
                <DataTable :value="dataDisciplinas" selectionMode="multiple" v-model:selection="selectionData"
                    dataKey="codigo">
                    <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
                    <Column field="codigo" header="Código"></Column>
                    <Column field="professor" header="Professor">
                        <template #body="slotProps">
                            <span>{{ slotProps.data.professor }}</span>
                        </template>
                    </Column>
                    <Column field="nome_disciplina" header="Disciplina">
                        <template #header>
                            <span>Disciplina</span>
                        </template>
                        <template #body="slotProps">
                            <span> {{ slotProps.data.nome_disciplina }} </span>
                        </template>
                    </Column>
                    <Column field="creditos" header="Créditos">
                    </Column>
                    <Column field="local" header="Local"></Column>
                    <Column field="horario" header="Horário"></Column>
                </DataTable>
                <InlineMessage severity="success" style="margin-top: 12px;" v-show="sucess">{{ message }}</InlineMessage>
                <InlineMessage severity="error" style="margin-top: 12px;" v-show="error">{{ message }}</InlineMessage>
                <div style="width: 150px; display: flex; margin: 24px 0px;">
                    <Button label="Inscrever-se" severity="info" raised @click="confirmSelection"
                        style="width: 100%;"></Button>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="filaDeEspera" modal header="Turma lotada!" style="width: 20%;">
            <div style="display: flex; flex-direction: column; margin-left: 8px;">
                <p>A turma selecionada está lotada!</p>
                <p>NOME: {{ disciplinaLotada.nome }}</p>
                <p>CÓDIGO: {{ disciplinaLotada.turma.codigo }}</p>
                <p>Deseja ser adicionado a lista de espera para esta turma?</p>
            </div>            
            <div style="display: flex; flex-direction: row; margin: 6px 12px; align-items: center; justify-content: center; gap: 16px;">
                <Button label="Sim" severity="info" raised style="width: 30%;" @click="confirmQueueAdd"></Button>
                <Button label="Não" severity="danger" raised  style="width: 30%;" @click="filaDeEspera = false"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import Divider from 'primevue/divider'
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InlineMessage from 'primevue/inlinemessage';
import Dialog from 'primevue/dialog';

// Variables

const dataDisciplinas = ref([]);
const selectionData = ref([]);
const disciplinaLotada = ref();
const loading = ref(true);
const message = ref();
const error = ref(false);
const sucess = ref(false);
const filaDeEspera = ref(false);
// Natvie Methods

onMounted(() => {
    getDisciplinas()
})

// Custom Methods
const getDisciplinas = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/inscricao/disciplinas');
        const data = await response.json();
        dataDisciplinas.value = data;
        console.log(dataDisciplinas.value);
        loading.value = false;
    } catch (error) {
        console.error(error)
    }
}

const confirmSelection = async () => {
    if (selectionData.value.length == 0) {
        message.value = 'Selecione pelo menos uma turma!'
        error.value = true
        return
    }
    
    try {        
        const response = await fetch('http://localhost:3000/api/inscricao/realizarInscricao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({                
                turmas: selectionData.value
            })
        });                
        console.log(response.status)

        if(response.status == 400){
            const data = await response.json();        
            message.value = data.message
            sucess.value = false
            error.value = true;
        }

        if(response.status == 401) {
            const data = await response.json();                    
            message.value = data.message
            sucess.value = false
            error.value = true; 
            filaDeEspera.value = true;
            disciplinaLotada.value = data.disciplina
        }

        if(response.status == 200){
            const data = await response.json();        
            message.value = data.message
            sucess.value = true
            error.value = false;
        }        

    } catch (error) {
        console.error(error);
        message.value = 'Ocorreu um erro ao realizar a inscrição';
        error.value = true;
    }
};

const confirmQueueAdd = async () => {
    try {        
        const response = await fetch('http://localhost:3000/api/inscricao/adicionarAFila', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({                
                disciplina: disciplinaLotada.value
            })
        });                                

        if(response.status == 200){
            const data = await response.json();        
            message.value = data.message
            sucess.value = true
            error.value = false;
        }        

    } catch (error) {
        console.error(error);
        message.value = 'Ocorreu um erro ao ser adicionado a fila!';
        error.value = true;
    }
}
</script>

<style scoped>
</style>