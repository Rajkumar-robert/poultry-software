const { app, BrowserWindow, ipcMain, dialog,shell} = require('electron');
const {sequelize} = require('./models');
const reportController = require('./controllers/reportControllers');
const path = require('path');



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    },
    autoHideMenuBar: true,  
    
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  sequelize.sync().then(() => {
    console.log('Database connected');
  })

  reportController.addNewRecords();
  reportController.getAllReports();
  reportController.queryReports();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// Function to handle PDF save location
ipcMain.handle('dialog:openSaveDialog', async () => {
  const result = await dialog.showSaveDialog({
      title: 'Save PDF',
      defaultPath: 'report.pdf',
      filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
      ]
  });

  if (result.canceled) {
      return null; // User canceled the dialog
  }

  return result.filePath; // Return the chosen file path
});

// Function to open the saved PDF file
ipcMain.handle('open-pdf', async (event, filePath) => {
  if (filePath) {
      shell.openPath(filePath); // Open the PDF file
  }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
