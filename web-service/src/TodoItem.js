import React from "react";

const API_BASE = 'http://localhost:4001/todo';

function TodoItem(props) {
  const { name, id, completed, setItems } = props;

  const toggleCompleted = async () => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      setItems(items => items.map(item => item._id === id ? { ...item, completed: !completed } : item));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete a task");
      }

      const data = await response.json();
      setItems(items => items.filter(item => item._id !== data._id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className={"todo" + (completed ? " check-complete" : "")} key={id}>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <div className="text">{name}</div>
      <div className="delete-todo" onClick={() => deleteTodo(id)}>
        <span>X</span>
      </div>
    </div>
  );
}

export default TodoItem;
