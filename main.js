const greenworks = require('greenworks');
const electron = require('electron');
const discord = require('discord-rpc')
const path = require('path');

const { app, BrowserWindow, Menu } = electron;
let steamAvailable = false;

// Initialize Discord RPC
const discordClientId = "772995176041283615";
discord.register(discordClientId);

const rpc = new discord.Client({ transport: "ipc" });
const startTimestamp = new Date();

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

    initializeSteamWorks();

    // create window
    let win = new BrowserWindow({
        show: false,
        icon: "resources/logo.png",
        webPreferences: {
            plugins: true
        },
        title: "Galaxy Life",
        autoHideMenuBar: true,
        darkTheme: true
    })

    initializeBrowserMenu(win);

    // load default page
    win.loadURL("https://game.galaxylifegame.net/game");
    win.maximize();

    win.webContents.session.clearCache(function () {
        //clearCache
    });

    // login to discord for rpc
    rpc.login({ clientId: discordClientId }).catch(console.error);
})

// Set activity every 15 seconds
rpc.on('ready', async () => {
    setDiscordActivity();

    setInterval(() => {
        setDiscordActivity();
    }, 15000);
});

app.on('window-all-closed', () => {
    // apparently darwins an edge case
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

async function setDiscordActivity() {
    // discord failed to setup
    if (!rpc) {
        return;
    }

    rpc.setActivity({
        details: "Pushing a starling on a swing",
        startTimestamp: startTimestamp,
        largeImageKey: "gl-icon",
        instance: false,
        buttons: [
            {
                label: "Play now!",
                url: "https://galaxylifegame.net"
            }
        ]
    });
}

function initializeBrowserMenu(win) {
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

function initializeSteamWorks() {
    try {
        // work around to make .init() (according to greenworks docs)
    process.activateUvLoop();

    if (!greenworks.init()) {
        console.log("Failed to initialize steamworks");
        return;
    }

    steamAvailable = true;
    } catch (error) {
        console.log(error);
    }
}

function isSteamAvailable() {
    return steamAvailable;
}

function getSteamFriends() {
    if (!steamAvailable) {
        return;
    }

    var friends = greenworks.getFriends(greenworks.FriendFlags.Immediate);
    return friends;
}

function getPersonaName() {
    if (!steamAvailable) {
        return;
    }

    return greenworks.getSteamId().getPersonaName();
}
