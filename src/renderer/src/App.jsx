import { useState, useEffect } from "react";

function App() {

  const [state, setState] = useState("");
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [plan, setPlan] = useState([]);
  const [displayTask, setDisplayTask] = useState([]);
  const currentDate = new Date();

  useEffect(() => {
    (async () => {
      const response = await window.ipcRenderer.readFile();
      console.log(response);
      setPlan(response);
    })();
  }, [state]);

 /* const ipcHandle = () => {
    window.electron.ipcRenderer.send("ping");
  };*/

  const options = {
    date: date,
    task: task
  };

  const writeFile = async () => {

    await window.ipcRenderer.writeFile(options);

    setTask("");
    setDate("");
    setState(state + 1);
  };
/*
  const deleteItem = async (index) => {
    await window.ipcRenderer.deletePlan(index);
    setState(state + 1);
  };

  const editPlan = async (index) => {
    await window.ipcRenderer.editPlan(index, options);
    setState(state + 1);
  };
*/
  const displayTaskToView = async (item) => {
    setDisplayTask(item);
  }


  return (
    <>
      <div className="container">
        <div className="action">
          <div>
            {plan
              .sort((a, b) => new Date(a.date) - new Date(b.date))  // Sort by date
              .map((item, index) => {
                const itemDate = new Date(item.date);  // Parse the MM/DD/YYYY date
                const difference = Math.round((itemDate - currentDate) / 86400000);  // Calculate day difference

                return (
                  <div key={index}>
                    <div className="plan">
                      <div
                        onClick={() => displayTaskToView(item)}
                        className="plan-date"
                        style={{
                          backgroundColor:
                            difference < 7 ? "#ff7979" :
                              difference >= 7 && difference < 14 ? "#ffff80" : "#7fff7f"
                        }}>
                        {item.date}
                      </div>
                    </div>
                  </div>
                );
              })}

          </div>
        </div>

        <div className="right-side">
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

          <div className="display-plan">
            {displayTask.task}
          </div>

        </div>
      </div>

    </>
  );
}

export default App;

