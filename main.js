const greenworks = require('greenworks');
const electron = require('electron');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;
let steamAvailable = false;

// Load correct flash player
let pluginName = null;
switch (process.platform) {
    case 'win32':
        switch (process.arch) {
            case 'ia32':
            case 'x32':
                pluginName = 'flashver/pepflashplayer32.dll'
                console.log("ran!");
                break
            case 'x64':
                pluginName = 'flashver/pepflashplayer64.dll'
                console.log("ran!");
                break
        }
        break
    case 'linux':
        switch (process.arch) {
            case 'ia32':
            case 'x32':
                break
            case 'x64':
                pluginName = 'flashver/libpepflashplayer.so'
                break
        }

        app.commandLine.appendSwitch('no-sandbox');
        break
    case 'darwin':
        pluginName = 'flashver/PepperFlashPlayer.plugin'
        break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
//CACHE IS ENABLED but restarted on launch!

let mainWindow;

app.on('ready', function () {

    InitializeSteamWorks();
    InitializeBrowserMenu();

    // create window
    let win = new BrowserWindow({
        show: false,
        //icon: "images/logo.ico",
        webPreferences: {
            plugins: true
        },
        title: "Galaxy Life",
        autoHideMenuBar: true,
        darkTheme: true
    })

    // load default page
    win.loadURL("https://game.galaxylifegame.net/game");
    win.maximize();

    win.webContents.session.clearCache(function () {
        //clearCache
    });
})

app.on('window-all-closed', () => {
    // apparently darwins an edge case
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

function InitializeBrowserMenu() {
    var menu = Menu.buildFromTemplate([
        {
            label: "Actions",
            submenu: [
                {
                    label: "Reload Game",
                    accelerator: process.platform === "darwin" ? "Cmd+R" : "Ctrl+R",
                    click() { win.loadURL("https://game.galaxylifegame.net/game"); }
                },
                {
                    label: "Reload",
                    acceleratorWorksWhenHidden: true,
                    accelerator: "F5",
                    click() { win.loadURL("https://game.galaxylifegame.net/game"); },
                    visible: false
                }
            ],
            
        },
        {
            label: "Options",
            submenu: [
                {
                    label: "Fullscreen",
                    accelerator: "F11",
                    click() { win.fullScreen = !win.fullScreen; }
                }
            ]
        },
    ]);

    Menu.setApplicationMenu(menu);
}

function InitializeSteamWorks() {
    // work around to make .init() (according to greenworks docs)
    process.activateUvLoop();

    if (!greenworks.init()) {
        console.log("Failed to initialize steamworks");
        return;
    }

    steamAvailable = true;
}

function IsSteamAvailable() {
    return steamAvailable;
}

function GetSteamFriends() {
    if (!steamAvailable) {
        return;
    }

    var friends = greenworks.getFriends(greenworks.FriendFlags.Immediate);
    return friends;
}

function GetPersonaName() {
    if (!steamAvailable) {
        return;
    }

    return greenworks.getSteamId().getPersonaName();
}
