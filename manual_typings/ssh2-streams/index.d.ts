declare module "ssh2-streams" {
    import stream = require('stream');

    /** returns an SSH2Stream constructor. */
    export class SSH2Stream extends stream.Transform { }

    /**
     * returns an SFTPStream constructor.
     */
    export class SFTPStream extends stream.Transform {
        writeFile(path:string, data, options, callback_);
    }

    /**
     * returns an object of useful utility functions.
     */
    export interface utils { }

    /**
     * returns an object containing useful SSH protocol constants.
     */
    export interface constants { }

}