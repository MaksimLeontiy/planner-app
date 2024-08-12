import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from "fs";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const readTasks = () => {
    const data = fs.readFileSync('./Tasks.json')
    return JSON.parse(data)
  }

  const writeTasks = (tasks) => {
    fs.writeFileSync('Tasks.json', JSON.stringify(tasks, null, 2));
  };

  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
  })
  // Function to display the plans in json file on start up
  ipcMain.handle('get-plan', async () =>{
    const tasks = readTasks()
    console.log(tasks)
    return tasks;
  })
  // Function to write the data into the json file
  ipcMain.handle('write-plan', async (event, options) => {

    const tasks = await readTasks()

    const date = options.date;
    const task = options.task;

    tasks.push({ date, task });

    await writeTasks(tasks)

  })
  // Function to delete the specific plan
  ipcMain.handle('delete-plan', async (event, index) => {
    const tasks = readTasks()

    tasks.splice(index, 1)

    await writeTasks(tasks)
  })

  ipcMain.handle('edit-plan', async (event, index, options) => {
    const tasks = readTasks()

    tasks.splice(index, 1, options)

    await writeTasks(tasks)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
