import * as ssh2 from 'ssh2';
import * as fs from "fs";


function test() {
    let conn = new ssh2.Client();
    conn.on('ready', function () {

        conn.exec('uptime', function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', function (data) {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', function (data) {
                console.log('STDERR: ' + data);
            });
        });
        let res = conn.sftp((err, sftp) => {
            if (err)
                console.log("ERR", err);
            sftp.readdir("ggg", (err, stats) => {
                console.log("STATS", stats, err);
                conn.end();
            });
        });
        console.log("sftp res", res);
    }).connect({
        host: 'g',
        port: 22,
        username: 'g',
        privateKey: fs.readFileSync("g:\\g\\id_rsa"),
        passphrase: "g",
    });
}

import "./live_sync";




    //export interface Monitor extends events.EventEmitter {
    //    on(event: "created", listener: (filename:string, stat: fs.Stats) => void);
    //    on(event: "changed", listener: (filename:string, stat: fs.Stats, prev: fs.Stats) => void);
    //    on(event: "removed", listener: (filename:string, stat: fs.Stats) => void);
    //    on(event: string, listener: Function): this;
    //}
