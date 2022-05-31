
const electron = require('electron');
const path = require('path');

const { app, BrowserWindow, Menu } = electron; //Menu generated for the purposes of visiting new URLs.

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
                pluginName = 'flashver/libpepflashplayer.so' // added and tested :D
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
//TODO: Support importing custom .swf files to play

let mainWindow;

app.on('ready', function () {

    var menu = Menu.buildFromTemplate([
        {
            label: "Fullscreen",
            click() {
                win.fullScreen = !win.fullScreen;
            }
        }
    ]);
    Menu.setApplicationMenu(menu);

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
    if (process.platform !== 'darwin') app.quit(); //fricking darwin!! >:D
})
