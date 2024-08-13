import { useEffect, useState } from "react";
import "./App.css";
import TaskCard from "./components/TaskCard";
import { Status, statuses, Task } from "./utils/data-tasks";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentlyHoveringOver, setCurrentlyHoveringOver] =
    useState<Status | null>(null);

  const columns = statuses.map((status) => {
    const tasksInColumn = tasks.filter((task) => task.status === status);
    return {
      status,
      tasks: tasksInColumn,
    };
  });

  useEffect(() => {
    fetch("http://localhost:3000/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      });
  }, []);

  const updateTask = (task: Task) => {
    fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    const updatedTasks = tasks.map((t) => {
      return t.id === task.id ? task : t;
    });
    setTasks(updatedTasks);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    setCurrentlyHoveringOver(null);
    const id = e.dataTransfer.getData("id");
    const task = tasks.find((task) => task.id === id);
    if (task) {
      updateTask({ ...task, status });
    }
  };

  const handleDragEnter = (status: Status) => {
    setCurrentlyHoveringOver(status);
  };

  return (
    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
      {columns.map((column) => (
        <div
          key={column.status}
          className="flex-1 min-w-0"
          onDrop={(e) => handleDrop(e, column.status)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => handleDragEnter(column.status)}
        >
          <div className="flex justify-between items-center p-4 bg-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 capitalize">
              {column.status}
            </h2>
            <span className="text-lg md:text-xl font-semibold text-gray-600">
              {column.tasks.reduce(
                (total, task) => total + (task?.points || 0),
                0
              )}
            </span>
          </div>
          <div
            className={`min-h-[200px] p-2 ${
              currentlyHoveringOver === column.status ? "bg-gray-200" : ""
            }`}
          >
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} updateTask={updateTask} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
