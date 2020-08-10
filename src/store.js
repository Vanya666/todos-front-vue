import Vue from 'vue';
import axios from 'axios';

const state = Vue.observable({
    todos: [],
    todoFiltered: []
});

export const getters = {
    todos: () => state.todos,
    todoFiltered: () => state.todoFiltered,
};

export const mutations = {
    setToDos: (val) => state.todos = val,
    appendToDos: (val) => state.todos.push(val),
    updateToDos: (val, index) => state.todos[index] = val,
    all: () => state.todoFiltered = state.todos,
    active: () => state.todoFiltered = state.todos.filter(function (todo) {
        return !todo.completed;
    }),
    completed: () => state.todoFiltered = state.todos.filter(function (todo) {
        return todo.completed;
    }),
};

export const actions = {
    fetchToDosFromApi() {
        return axios.get(`http://127.0.0.1:8000/api/v1/todos/`).then((res) => {
            mutations.setToDos(res.data.data);
            mutations.all();
        }).catch(e => {
            this.errors.push(e);
        });
    },
    addToDosApi(data) {
        return axios.post(`http://127.0.0.1:8000/api/v1/todo/create`, {
            description: data
        }).then(res => {
            mutations.appendToDos(res.data.data);
            mutations.all();
        }).catch(e => {
            this.errors.push(e);
        });
    },
};