import { useState, useEffect } from "react";

function App() {

  const [state, setState] = useState("");
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [plan, setPlan] = useState([]);
  const currentDate = new Date();

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
    setState(state + 1);
  };

  const deleteItem = async (index) => {
    await window.ipcRenderer.deletePlan(index);
    setState(state + 1);
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
            {plan.sort((a, b) => Date.parse(new Date(a.date.split("/").reverse().join("-"))) - Date.parse(new Date(b.date.split("/").reverse().join("-"))))
              .map((item, index) => {const difference = Math.round((new Date(item.date) - currentDate) / 86400000)
                return (
              <div key={index}>
                <div
                  style = {{backgroundColor: difference < 7 ? "red" : difference >= 7 && difference < 14 ? "yellow" : "green"}}
                  className="plan">
                  <p className="plan-date">Date: {item.date} {difference}</p>
                  <p className="plan-task">Task: {item.task}</p>
                  <button className="plan-delete" onClick={() => deleteItem(index)}>
                    Delete
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

