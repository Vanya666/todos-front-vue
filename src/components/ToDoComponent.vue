<template>
    <div>
        <li v-for="(todo, index) in todoFiltered" class="todo" :key="index"
            :class="{ completed: todo.completed, editing: todo == editedTodo }">
            <div class="view">
                <input class="toggle" v-bind:true-value="1" v-bind:false-value="0" type="checkbox"
                       v-model="todo.completed" @change="someHandler(todo,index)"/>
                <label @dblclick="editTodo(todo)">{{ todo.description }}</label>
                <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input class="edit" type="text" v-model="todo.description"
                   v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)"
                   @keyup.esc="cancelEdit(todo)"/>
        </li>
    </div>
</template>

<script>
    import axios from 'axios';
    import {getters, mutations} from "../store.js";

    export default {
        name: 'ToDoComponent',
        data: function () {
            return {
                editedTodo: null,
            }
        },
        methods: {
            someHandler: function (todo, index) {
                axios.put(`http://127.0.0.1:8000/api/v1/todo/complete/`, {
                    completedIds: [todo.id],
                    completed: todo.completed,
                }).then(response => {
                    console.log(response);
                    mutations.updateToDos(todo, index);
                }).catch(e => {
                    console.log(e)
                });
            },
            editTodo: function (todo) {
                this.beforeEditCache = todo.description;
                this.editedTodo = todo;
            },
            doneEdit: function (todo) {
                if (!this.editedTodo) {
                    return;
                }
                axios.put(`http://127.0.0.1:8000/api/v1/todo/update`, {
                    description: todo.description,
                    id: todo.id,
                }).then(response => {
                    this.editedTodo = null;
                    todo.description = response.data.data.description;
                    if (!todo.description) {
                        this.removeTodo(todo);
                    }
                }).catch(e => {
                    this.errors.push(e);
                });
            },
            cancelEdit: function (todo) {
                this.editedTodo = null;
                todo.description = this.beforeEditCache;
            },
            removeTodo: function (todo) {
                axios.delete(`http://127.0.0.1:8000/api/v1/todo/delete/${todo.id}`).then(response => {
                    console.log(response);
                    this.todos.splice(this.todos.indexOf(todo), 1);
                }).catch(e => {
                    this.errors.push(e);
                });
            },
        },

        computed: {
            ...getters,
        },

        directives: {
            "todo-focus": function (el, binding) {
                if (binding.value) {
                    el.focus();
                }
            }
        },
    }
</script>