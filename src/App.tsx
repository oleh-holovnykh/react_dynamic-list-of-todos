/* eslint-disable max-len */
/* eslint-disable no-console */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import debounce from 'lodash/debounce';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { getTodos } from './api';
import { Todo } from './types/Todo';
import { Select } from './types/Select';

export const filterTodos = (s: Select, q: string, t: Todo[]): Todo[] => {
  const lowerAppliedQuery = q.toLowerCase();

  return t
    .filter(td => {
      switch (s) {
        case Select.COMPLETED:
          return td.completed;
        case Select.ACTIVE:
          return !td.completed;
        default:
          return true;
      }
    })
    .filter(td => td.title.toLowerCase().includes(lowerAppliedQuery));
};

export const getTodoById = (id: number, arr: Todo[]): Todo | null => (
  arr.find(todo => todo.id === id) || null
);

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodoId, setSelectedTodoId] = useState(0);
  const [select, setSelect] = useState<Select>(Select.ALL);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');

  const handleTodosLoading = useCallback(() => {
    const loadingTodos = async () => {
      try {
        let todosFromServer = await getTodos();

        todosFromServer = todosFromServer.filter(todo => {
          const {
            id,
            title,
            completed,
            userId,
          } = todo;

          return (id > 0) && (title.trim()) && (typeof completed === 'boolean') && (userId > 0)
            ? true
            : console.log('filtered some todo from server');
        });
        setTodos(todosFromServer);
      } catch (error) {
        console.log('you catched some error');
      }
    };

    loadingTodos();
  }, []);

  useEffect(handleTodosLoading, []);

  const visibleTodos = useMemo(() => (
    filterTodos(select, appliedQuery, todos)
  ), [appliedQuery, select, todos]);

  useEffect(debounce(() => setAppliedQuery(query), 700), [query]);

  const handleSelectedIdChange = useCallback((todoId) => {
    setSelectedTodoId(todoId);
  }, []);

  const handleCloseClick = useCallback(() => {
    setSelectedTodoId(0);
  }, []);

  const handleSelectChange = useCallback((event) => {
    setSelect(event.target.value);
  }, []);

  const handleQueryChange = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  const handleInputReset = useCallback(() => setQuery(''), []);

  const selectedTodo = useMemo(() => (
    getTodoById(selectedTodoId, todos)
  ), [selectedTodoId]);

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                status={select}
                onSelectChange={handleSelectChange}
                query={query}
                onQueryChange={handleQueryChange}
                onInputReset={handleInputReset}
              />
            </div>

            <div className="block">
              {todos.length === 0
                ? <Loader />
                : (
                  <TodoList
                    todos={visibleTodos}
                    onSelectedIdChange={handleSelectedIdChange}
                    todoId={selectedTodoId}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
      {selectedTodo && <TodoModal todo={selectedTodo} onClose={handleCloseClick} />}
    </>
  );
};
