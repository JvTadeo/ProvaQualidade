<template>
  <div class="academic-system">
    <!-- Cabeçalho -->
    <header class="header">
      <h1>SISTEMA ACADÊMICO</h1>
      <p>Bem vindo(a)! Selecione as disciplinas que deseja se inscrever!</p>
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

      <div class="action-button">
        <Button label="Inscrever-se" severity="info" raised @click="confirmSelection"></Button>
      </div>
    </section>

    <Dialog v-model:visible="filaDeEspera" modal header="Turma lotada!" style="width: '30rem';">
      <div class="dialog-content">
        <span class="p-text-secondary block mb-5">A turma selecionada está lotada!</span>
        <p class="font-semibold w-6rem">NOME: {{ disciplinaLotada.nome }}</p>
        <p class="font-semibold w-6rem">CÓDIGO: {{ disciplinaLotada.turma.codigo }}</p>
        <p class="p-text-secondary block mb-5">Deseja ser adicionado a lista de espera para esta turma?</p>
      </div>
      <div class="dialog-actions flex justify-content-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="filaDeEspera = false; clearSelection()" class="cancel-button"></Button>
        <Button label="Sim" @click="confirmQueueAdd" class="confirm-button"></Button>
      </div>
    </Dialog>

    <Toast ref="toast" />
  </div>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

// Variáveis
const dataDisciplinas = ref([]);
const selectionData = ref([]);
const disciplinaLotada = ref();
const loading = ref(true);
const filaDeEspera = ref(false);

// Toast
const toast = useToast();

// Métodos Nativos
onMounted(() => {
  getDisciplinas();
})

// Métodos Customizados
const getDisciplinas = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/inscricao/disciplinas');
    const data = await response.json();
    dataDisciplinas.value = data;
    console.log(dataDisciplinas.value);
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
}

const clearSelection = () => {
  selectionData.value = [];
}

const confirmSelection = async () => {
  if (selectionData.value.length == 0) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Selecione pelo menos uma turma!', life: 3000 });
    return;
  }
  
  try {        
    const response = await fetch('http://localhost:3000/api/inscricao/realizarInscricao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ turmas: selectionData.value })
    });
    console.log(response.status);

    if (response.status == 400) {
      const data = await response.json();
      toast.add({ severity: 'error', summary: 'Erro', detail: data.message, life: 3000 });
      clearSelection();
    }

    if (response.status == 401) {
      const data = await response.json();
      toast.add({ severity: 'error', summary: 'Erro', detail: data.message, life: 3000 });
      filaDeEspera.value = true;
      disciplinaLotada.value = data.disciplina;
    }

    if (response.status == 200) {
      const data = await response.json();
      toast.add({ severity: 'success', summary: 'Sucesso', detail: data.message, life: 3000 });
      clearSelection();
    }

  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao realizar a inscrição', life: 3000 });
    clearSelection();
  }
};

const confirmQueueAdd = async () => {
  try {        
    const response = await fetch('http://localhost:3000/api/inscricao/adicionarAFila', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disciplina: disciplinaLotada.value })
    });

    if (response.status == 200) {
      const data = await response.json();
      toast.add({ severity: 'success', summary: 'Sucesso', detail: data.message, life: 3000 });
      filaDeEspera.value = false;
      clearSelection();
    }

  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao ser adicionado a fila!', life: 3000 });
    clearSelection();
  }
}
</script>

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

.action-button Button:hover {
  background-color: #004d99;
  border-color: #004d99;
}

.action-button Button {
  font-size: 20px;
}

.action-button .p-button {
  padding: 10px 20px;
}

.p-dialog {
  padding: 0 10px;
  background-color: #ffffff;
}

.p-dialog-content {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  padding: 10px;
}

.p-dialog-header {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 10px;
}

.dialog-content {
  font-size: 16px;
  color: #444;
}

.dialog-content p {
  margin: 8px 0;
}

.dialog-actions {
  display: flex;
  justify-content: end;
  gap: 16px;
  margin: 16px 0;
}

.confirm-button,
.cancel-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
}

.confirm-button {
  background-color: #10b981!important;
  border: none;
  color: white;
}

.confirm-button:hover {
  background-color: #059669!important;
}

.cancel-button {
  background-color: #e2e8f0!important;
  border: none;
  color: #333;
}

.cancel-button:hover {
  background-color: #cbd5e1!important;
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
  background-color: var(--background-color)!important;
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

.p-toast-message{
  padding: 10px;
}

.p-toast-message-text{
  margin-left: 10px;
}
</style>
