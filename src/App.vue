<template>
    <div id="app">
        <p style="text-align: center">&nbsp;<a href="http://localhost:8000/api/documentation" target="_blank">View Documentations</a></p>
        <section class="todoapp">
            <header class="header">

                <h1>todos</h1>
                <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?"
                       v-model="newTodo" @keyup.enter="addTodo"/>
            </header>
            <section class="main" v-show="todos.length" v-cloak>
                <input id="toggle-all" v-bind:true-value="1" v-bind:false-value="0" class="toggle-all" type="checkbox"
                       v-model="allDone" @change="setCompleted"/>
                <label for="toggle-all"></label>
                <ul class="todo-list">
                    <ToDoComponent v-if="loaded" />
                </ul>
            </section>
            <footer class="footer" v-show="todos.length" v-cloak>
                <span class="todo-count">
                  <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
                </span>
                <ul class="filters">
                    <li>
                        <a href="" @click.prevent="all()" :class="{ selected: visibility == 'all' }">All</a>
                    </li>
                    <li>
                        <a href="" @click.prevent="active()"
                           :class="{ selected: visibility == 'active' }">Active</a>
                    </li>
                    <li>
                        <a href="" @click.prevent="completed()"
                           :class="{ selected: visibility == 'completed' }">Completed</a>
                    </li>
                </ul>
                <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
                    Clear completed
                </button>
            </footer>
        </section>
    </div>
</template>

<script>
    import ToDoComponent from './components/ToDoComponent.vue';
    import axios from 'axios';
    import { getters, mutations, actions } from "./store.js";

    export default {
        name: 'App',
        components: {
            ToDoComponent
        },

        data: function () {
            return {
                newTodo: "",
                visibility: "all",
                selected_ids: [],
                allDone: 0,
                errors: [],
                loaded: false,
            }
        },

        created() {
            this.fetchToDosFromApi().then(() => {
                mutations.all();
                this.loaded = true
            });
        },

        filters: {
            pluralize: function (n) {
                return n === 1 ? "item" : "items";
            }
        },

        methods: {
            // Append Methods from store js
            ...mutations,
            ...actions,

            addTodo: function () {
                var value = this.newTodo && this.newTodo.trim();
                if (!value) return;
                this.addToDosApi(value).then(() => {
                    this.all();
                    this.updateAllDone();
                    this.newTodo = "";
                });
            },
            setCompleted: function () {
                var self = this;
                let uncompleted = [];
                if (self.allDone) {
                    self.active(self.todos).forEach(function (index) {
                        uncompleted.push(index.id)
                    });
                } else {
                    self.completed(self.todos).forEach(function (index) {
                        uncompleted.push(index.id)
                    });
                }
                axios.put(`http://127.0.0.1:8000/api/v1/todo/complete`, {
                    completedIds: uncompleted,
                    completed: self.allDone,
                }).catch(e => {
                    console.log(e)
                });
                self.todos.forEach(function (todo) {
                    todo.completed = self.allDone;
                });
                self.all();
            },
            removeCompleted: function () {
                var self = this;
                self.todos.forEach(function (index) {
                    if (index.completed) self.selected_ids.push(index.id);
                });
                axios.delete(`http://127.0.0.1:8000/api/v1/todos/delete-completed`, {
                    data: {
                        selectedIds: self.selected_ids
                    }
                }).then(response => {
                    console.log(response);
                    self.fetchToDosFromApi();
                    self.selected_ids = []
                }).catch(e => {
                    self.errors.push(e);
                });
            },
            updateAllDone: function(){
                if (this.todoFiltered.length && !this.remaining) {
                    this.allDone = 1;
                } else {
                    this.allDone = 0;
                }
            }
        },

        // computed properties
        computed: {
            ...getters,
            remaining: function () {
                return this.todoFiltered.filter(function (todo) {
                    return !todo.completed;
                }).length;
            },
        },

        mounted() {
            if (!Object.keys(this.todos.length)) this.loaded = false
        }
    }
</script>
