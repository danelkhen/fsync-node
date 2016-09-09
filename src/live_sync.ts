import * as fs     from "fs";
import * as watch  from "watch";
import {Transport} from "./transport";
import * as path   from "path";

// read arguments from command line
// node lib/live_sync.js  path_to_folder host_name username password path_on_server
// 

if (process.argv.length < 7) {
    console.log("")
    console.log("USAGE:")
    console.log("live_sync <path_to_folder> <host_name> <username> <password> <path_on_server>")
    console.log("")
    process.exit()
}

var watchPath = process.argv[2];
var ftpHost = process.argv[3];
var ftpUser = process.argv[4];
var ftpPass = process.argv[5];
var ftpPath = process.argv[6];
console.log({ watchPath, ftpHost, ftpUser, ftpPass, ftpPath });

var transport = new Transport({
    type: 'sftp',
    host: ftpHost,
    port: 22,
    username: ftpUser,
    password: ftpPass,
    path: ftpPath
})

transport.on('ready', function () {

    var ignore = /(\.git\b)/

    console.log("watching " + watchPath);
    watch.createMonitor(watchPath, {
        ignoreDotFiles: true
    }, monitor => {
        monitor.on('created', createFile);
        monitor.on('changed', updateFile);
        monitor.on('removed', deleteFile);
    });

    function toUnix(filePath: string): string {
        while (filePath.indexOf("\\") >= 0)
            filePath = filePath.replace("\\", "/");
        return filePath;
    }

    function toRemotePath(filePath: string): string {
        var relativeFilePath = path.relative(watchPath, filePath)
        var ss = toUnix(relativeFilePath);
        return ss;
    }

    function createFile(filePath: string, stat: fs.Stats) {
        var relativeFilePath = toRemotePath(filePath)
        console.log("created", filePath, "->", relativeFilePath);

        if (stat.isDirectory()) {
            transport.createDirectory(relativeFilePath, function (error) {
                if (error) {
                    console.log("createDirectory ERROR (" + relativeFilePath + ")");
                    console.log(error);
                    return
                }
            })
        } else {
            transport.createFile(relativeFilePath, fs.readFileSync(filePath), function (error) {
                if (error) {
                    console.log("createFile ERROR (" + relativeFilePath + ")");
                    console.log(error);
                    return
                }
            })
        }
    };

    function updateFile(filePath: string, curr: fs.Stats, prev: fs.Stats) {
        var relativeFilePath = toRemotePath(filePath)
        console.log("updated", filePath, "->", relativeFilePath);

        transport.updateFile(relativeFilePath, fs.readFileSync(filePath), function (error) {
            if (error) {
                console.log("updateFile ERROR (" + relativeFilePath + ")");
                console.log(error);
                return
            }
            return console.log("Done.");
        })
    };

    function deleteFile(filePath: string, stat: fs.Stats) {
        var relativeFilePath = toRemotePath(filePath)
        console.log("removed", filePath, "->", relativeFilePath);

        if (stat.isDirectory()) {
            transport.deleteDirectory(relativeFilePath, function (error) {
                if (error) {
                    console.log("deleteDirectory ERROR (" + relativeFilePath + ")");
                    console.log(error);
                    return
                }
            });
        } else {
            transport.deleteFile(relativeFilePath, function (error) {
                if (error) {
                    console.log("deleteFile ERROR (" + relativeFilePath + ")");
                    console.log(error);
                    return;
                }
            });
        }
    };
})