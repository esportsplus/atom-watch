'use babel';

import { CompositeDisposable } from 'atom';
import { exec } from 'child_process';
import fs from 'fs';
import minimatch from 'minimatch';
import mkdirp from 'mkdirp';
import path from 'path';


const PACKAGE_NAME = 'Atom-Watch';
const FILENAME = 'package.json';
const FILENAME_KEY = 'atom-watch';
const TIMEOUT = 60 * 1000; // 1 minute


let toArray = (value) => {
    return (value && !Array.isArray(value)) ? [value] : value;
};


export default {
    activate() {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
            this.subscriptions.add(textEditor.onDidSave(this.handleDidSave.bind(this)));
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    handleDidSave(event) {
        let savedFile = event.path,
            rootDir = this.findRootDir( path.dirname(savedFile) );

        if (!rootDir) {
            return;
        }

        let configs = this.loadConfigs(rootDir);
        savedFile = path.relative(rootDir, savedFile);

        for (let i = 0; i < configs.length; i++) {
            let config = configs[i];

            this.run({rootDir, config, savedFile});
        }
    },

    findRootDir(dir) {
        if (fs.existsSync( path.join(dir, FILENAME) )) {
            return dir;
        }

        let parentDir = path.join(dir, '..');

        if (parentDir === dir) {
            return undefined;
        }

        return this.findRootDir(parentDir);
    },

    loadConfigs(rootDir) {
        let configs = JSON.parse( fs.readFileSync(path.join(rootDir, FILENAME), 'utf8') );
            configs = configs[FILENAME_KEY] || [];

        return toArray(configs).map(config => this.normalizeConfig(config));
    },

    normalizeConfig({
        files,
        command,
        alerts = true
    }) {
        var error = (name) => {
            atom.notifications.addError(PACKAGE_NAME, {
                detail: `Required parameter(s) '${name}' missing from '${FILENAME}'!`,
                dismissable: true
            });
        };

        if (!command) {
            error('command');
        }

        if (!files) {
            error('files');
        }

        files = toArray(files);

        return { files, command, alerts };
    },

    run({rootDir, savedFile, config}) {
        if (!config.files.find((glob) => minimatch(savedFile, glob))) {
            return;
        }

        mkdirp.sync(path.join(rootDir, path.dirname( savedFile )));

        exec(config.command, { cwd: rootDir, timeout: TIMEOUT }, (err, stdout, stderr) => {
            let error = stderr.trim() || (err && err.message),
                output = stdout.trim();

            if (config.alerts) {
                if (output) {
                    atom.notifications.addSuccess(PACKAGE_NAME, {detail: output, dismissable: true});
                }

                if (error) {
                    atom.notifications.addError(PACKAGE_NAME, {detail: error, dismissable: true});
                }
            }
        });
    }
};
