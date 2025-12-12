const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");
const path = require("path");

let win;
let splash;
let tabs = [];
let activeTab = null;

function createSplash() {
  splash = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, "palm-tree.ico")
  });
  splash.loadFile("splash.html");
}

function createWindow() {
  createSplash();

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#6dd5ed",
    icon: path.join(__dirname, "palm-tree.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");

  win.once("ready-to-show", () => {
    splash.close();
    win.show();
  });

  createTab("home");
  win.on("resize", resizeView);
}

function createTab(target) {
  const view = new BrowserView({ webPreferences: { contextIsolation: true } });
  const tab = { id: Date.now(), view, title: "New Tab" };

  if (target === "home") {
    view.webContents.loadFile("landing.html");
    tab.title = "Home";
  } else if (target === "settings") {
    view.webContents.loadFile("settings.html");
    tab.title = "Settings";
  } else {
    view.webContents.loadURL(target);
  }

  view.webContents.on("page-title-updated", (_, title) => {
    tab.title = title;
    sendTabs();
  });

  tabs.push(tab);
  setActiveTab(tab.id);
  sendTabs();
}

function setActiveTab(id) {
  if (activeTab) win.removeBrowserView(activeTab.view);
  activeTab = tabs.find(t => t.id === id);
  win.addBrowserView(activeTab.view);
  resizeView();
}

function resizeView() {
  if (!activeTab) return;
  const { width, height } = win.getBounds();
  activeTab.view.setBounds({ x: 0, y: 140, width, height: height - 140 });
}

function sendTabs() {
  win.webContents.send("tabs", tabs.map(t => ({ id: t.id, title: t.title })));
}

/* IPC */
ipcMain.on("new-tab", () => createTab("home"));
ipcMain.on("open-settings", () => createTab("settings"));
ipcMain.on("switch-tab", (_, id) => setActiveTab(id));
ipcMain.on("navigate", (_, url) => activeTab?.view.webContents.loadURL(url));
ipcMain.on("back", () => activeTab?.view.webContents.goBack());
ipcMain.on("forward", () => activeTab?.view.webContents.goForward());
ipcMain.on("reload", () => activeTab?.view.webContents.reload());

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
