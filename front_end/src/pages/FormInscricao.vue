<template>
    <div class="academic-system">
      <!-- Cabeçalho -->
      <header class="header">
        <h1>SISTEMA ACADÊMICO</h1>
        <p>Olá! Preencha todas as informações para se inscrever!</p>
      </header>
  
      <Divider />
  
      <!-- Tabela de Inscrição -->
      <section class="course-selection">
        <DataTable :value="dataDisciplinas" selectionMode="multiple" v-model:selection="selectionData" dataKey="codigo" responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="codigo" header="Código" headerStyle="padding: 10px;" bodyStyle="padding: 10px;"></Column>
          <Column field="professor" header="Professor" headerStyle="padding: 10px;" bodyStyle="padding: 10px;">
            <template #body="slotProps">
              <span>{{ slotProps.data.professor }}</span>
            </template>
          </Column>
          <Column field="nome_disciplina" header="Disciplina" headerStyle="padding: 10px;" bodyStyle="padding: 10px;">
            <template #body="slotProps">
              <span>{{ slotProps.data.nome_disciplina }}</span>
            </template>
          </Column>
          <Column field="creditos" header="Créditos" headerStyle="padding: 10px;" bodyStyle="padding: 10px;"></Column>
          <Column field="local" header="Local" headerStyle="padding: 10px;" bodyStyle="padding: 10px;"></Column>
          <Column field="horario" header="Horário" headerStyle="padding: 10px;" bodyStyle="padding: 10px;"></Column>
        </DataTable>
  
        <Message severity="success" style="margin-top: 12px;" v-show="sucess">{{ message }}</Message>
        <Message severity="error" style="margin-top: 12px;" v-show="error">{{ message }}</Message>
  
        <div class="action-button">
          <Button label="Inscrever-se" severity="info" raised @click="confirmSelection"></Button>
        </div>
      </section>
  
      <!-- Diálogo de Confirmação -->
      <Dialog v-model:visible="filaDeEspera" modal header="Turma lotada!" style="width: 20%;">
        <div class="dialog-content">
          <p>A turma selecionada está lotada!</p>
          <p>NOME: {{ disciplinaLotada.nome }}</p>
          <p>CÓDIGO: {{ disciplinaLotada.turma.codigo }}</p>
          <p>Deseja ser adicionado a lista de espera para esta turma?</p>
        </div>
        <div class="dialog-actions">
          <Button label="Sim" severity="info" raised @click="confirmQueueAdd"></Button>
          <Button label="Não" severity="danger" raised @click="filaDeEspera = false"></Button>
        </div>
      </Dialog>
    </div>
  </template>

<style>
.academic-system {
  width: 70%;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 16px;
}

.header h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: #004d99;
}

.header p {
  margin-top: 8px;
  font-size: 16px;
  color: #666;
}

.course-selection {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p-datatable .p-datatable-thead > tr > th,
.p-datatable .p-datatable-tbody > tr > td {
  padding: 10px;
}

.action-button {
  width: 150px;
  margin: 24px 0;
  text-align: center;
}

.action-button Button:hover{
    background-color: #004d99;
    border-color: #004d99;
}

.action-button Button{
    font-size: 20px;
}

.action-button .p-button {
  padding: 10px 20px;
}

.dialog-content {
  margin-left: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 6px 12px;
}

/* Paleta de Cores */
:root {
  --primary-color: #004d99;
  --secondary-color: #0099cc;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}

header {
  color: var(--primary-color);
}

.p-button {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.p-button.p-button-info {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.p-dialog .p-dialog-header {
  background-color: var(--primary-color);
  color: #fff;
}
</style>

<script setup>
import Divider from 'primevue/divider'
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Message from 'primevue/message';
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