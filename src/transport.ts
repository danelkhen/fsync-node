import * as path        from "path";
import * as ssh2        from 'ssh2';
import * as util        from 'util';
import {EventEmitter}   from 'events';


export class Transport extends EventEmitter {
    constructor(config: TransportConfig) {
        super();
        this.config = config;
        this.initConnection()
    }
    connection: ssh2.Client;
    config: TransportConfig;
    sftp:ssh2.Sftp.SFTPWrapper;

    initConnection() {
        this.connection = new ssh2.Client();

        this.connection.on("error", e => {
            console.log("FTP error", e);
        });
        this.connection.on("timeout", e => {
            console.log(e);
        });
        this.connection.on("close", e => {
            console.log("Closed.");
        });
        this.connection.on("end", e => {
            console.log("FTP connection closed.");
        });
        this.connection.on("ready", () => {
            console.log("FTP connection ready.");
            return this.connection.sftp((err, sftpClient) => {
                if (err) {
                    console.log("SFTP ERR");
                    throw err;
                }
                this.sftp = sftpClient;
                this.emit('ready');
                console.log("sftp is ready to go!");
            });
        });

        console.log("Connecting to " + this.config.username + ":" + this.config.password + "@" + this.config.host + ":22");
        this.connection.connect({
            host: this.config.host,
            port: 22,
            username: this.config.username,
            password: this.config.password
        });
    };

    createFile(relativeFilePath:string, data, callback) {
        this.updateFile(relativeFilePath, data, callback)
    };
    updateFile(relativeFilePath:string, data, callback) {
        console.log("updating " + this.config.host + '/' + relativeFilePath);
        this.sftp.writeFile(relativeFilePath, data, callback);
    };
    deleteFile(relativeFilePath:string, callback) {
        console.log("deleting " + this.config.host + '/' + relativeFilePath);
        this.sftp.unlink(relativeFilePath, callback)
    };

    createDirectory(relativeFilePath:string, callback) {
        console.log("creating " + this.config.host + '/' + relativeFilePath);
        this.sftp.mkdir(relativeFilePath, callback)
    };
    deleteDirectory(relativeFilePath:string, callback) {
        console.log("deleting " + this.config.host + '/' + relativeFilePath);
        this.sftp.rmdir(relativeFilePath, callback)
    };
}


export interface TransportConfig {
    type: 'sftp' | string,
    host: string,
    port: number,
    username: string,
    password: string,
    path: string,
}
