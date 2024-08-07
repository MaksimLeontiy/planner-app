import { useState, useEffect } from "react";

function App() {

  const [state, setState] = useState("");
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await window.ipcRenderer.readFile();
      console.log(response);
      setPlan(response);
    })();
  }, [state]);

  const ipcHandle = () => {
    window.electron.ipcRenderer.send("ping");
  };

  const writeFile = async () => {

    const options = {
      date: date,
      task: task
    };

    await window.ipcRenderer.writeFile(options);

    setTask("");
    setDate("");
    setState(1);
  };

  const deleteItem = async (index) => {
    await window.ipcRenderer.deletePlan(index);
    setState(2);
  };

  return (
    <>
      <div className="container">
        <div className="input-container">

          <input
            value={date}
            type="date"
            className="date"
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            value={task}
            className="input"
            placeholder="Write Task Here..."
            onChange={(e) => setTask(e.target.value)}
          />

          <button
            className="add-task"
            onClick={writeFile}>
            Add
          </button>

        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
          <div>
            {plan.map((item, index) => (
              <div key={index}>
                <div className="plan">
                  <p className="plan-date">Date: {item.date}</p>
                  <p className="plan-task">Task: {item.task}</p>
                  <button className="plan-delete" onClick={() => deleteItem(index)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

