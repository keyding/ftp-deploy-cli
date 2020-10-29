#!/usr/bin/env node
const ftp = require("basic-ftp");
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');
const signale = require('signale');
const chalk = require('chalk');
const fs = require('fs');
const pkg = require('../package.json');

const cfgFilePath = _resolve('ftp.config.js');

const SUFFIXS = ['KB', 'MB', 'GB', 'TB'];

const TIMEOUT = 10000;

let config = {}

program
    .version(pkg.version,'-v, --version')

program
    .command('init')
    .description('Init configuration information.')
    .action(init);

program
    .command('config')
    .description('view the configuration file - ftp.config.js.')
    .action(viewConfig);

program
    .command('start')
    .description('Upload with the configuration file - ftp.config.js.')
    .action(start);

program.parse(process.argv);

function init() {
    fs.stat(cfgFilePath, (err, stats) => {
        if(err || !stats) {
            initHandle();
        } else {
            inquirer.prompt([
                {
                    type: 'input',
                    message: `The ${chalk.green('ftp.config.js')} file already exists, do you want to reconfigure? y/N`,
                    default: 'N',
                    name: 'value'
                }
            ]).then(result => {
                if(result.value.toLowerCase() === 'y') {
                    initHandle();
                }
            })
        }
    });
}

function initHandle() {
    inquirer.prompt([
        {
            type: 'input',
            message: `Please input ${chalk.green('host')}:`,
            name: 'host'
        }, 
        {
            type: 'input',
            message: `Please input ${chalk.green('port')}:`,
            default: 21,
            name: 'port'
        },
        {
            type: 'input',
            message: `Please input ${chalk.green('user')}:`,
            name: 'user'
        }, 
        {
            type: 'input',
            message: `Please input ${chalk.green('password')}:`,
            name: 'password'
        },
        {
            type: 'input',
            message: `Please input ${chalk.green('targetDir')}:`,
            name: 'targetDir'
        },
        {
            type: 'input',
            message: `Please input ${chalk.green('localDir')}:`,
            name: 'localDir'
        },
    ]).then(userConfig => {
        fs.writeFile(_resolve('ftp.config.js'), 'module.exports = ' + JSON.stringify(userConfig, null, 2), (err) => {
            if(err) {
                signale.warn(`Build configuration file fail. please run again ${chalk.green('`deploy init`')} next time or configure manually. `)
            } else {
                signale.success(`Configuration file ${chalk.green('ftp.config.js')} has been generated. Run ${chalk.green('`deploy start`')} to uploador ${chalk.green('`deploy config`')} to view configuration. `)

                // Write `ftp.config.js` to `.gitignore`
                fs.stat(_resolve('.gitignore'), (err) => {
                    if(!err) {
                        fs.appendFile(_resolve('.gitignore'), '\n\n# ftp.config.js \nftp.config.js', () => {});
                    }
                })
            }
        })
    }) 
};

function viewConfig() {
    fs.stat(cfgFilePath, (err, stats) => {
        if(err || !stats) {
            signale.warn(`The configuration file ${chalk.green('`ftp.config.js`')} does not exist, please run the ${chalk.green('`deploy init`')} command to configure the information.`)
        } else {
            console.log(JSON.stringify(require(cfgFilePath), null, 2));
        }
    });
}

function start() {
    fs.stat(cfgFilePath, (err, stats) => {
        if(err || !stats) {
            signale.warn(`Please run the ${chalk.green('`deploy init`')} command to configure the information(${chalk.gray('will be generate the configuration file ')}${chalk.green('ftp.config.js')}) or manually set the configuration file ${chalk.green('ftp.config.js')}. `)
        } else {
            config = require(cfgFilePath);
            handleUpload();
        }
    });
}

async function handleUpload() {
    
    const { host, port, user, password, targetDir, localDir } = config;

    if(!targetDir) {
        signale.error(`Please assign the target directory: ${chalk.green('targetDir')}.`);
        return ;
    }

    if(!localDir) {
        signale.error(`Please assign the target directory: ${chalk.green('localDir')}.`);
        return ;
    }

    const client = new ftp.Client(TIMEOUT);

    let uploadFiles = '';

    let allBytes = 0;

    client.ftp.verbose = false;
    
    client.trackProgress(info => {
        const { type, name, bytesOverall } = info

        if(type === 'upload') {
            if((name && !uploadFiles) || uploadFiles !== name) {
                uploadFiles = name;
                signale.pending(name);
            }
        } 

        allBytes = bytesOverall;
    })

    try {
        signale.info('Connecting ...');
        await client.access({
            host,
            port,
            user,
            password,
        })
        signale.success('Connection succeeded.');
        await client.ensureDir(targetDir);
        await client.clearWorkingDir();
        signale.info('Ready to upload ...');
        await client.uploadFromDir(localDir);

        client.close();
        signale.success('Upload successfully. ' + 'Total: ' + _formatSize(allBytes));
    }
    catch(err) {
        client.close();
        signale.error(err);
    }
}

function _resolve(_path) {
    return path.resolve(_path);
}

function _formatSize(bytes = 0) {
    let n = 0;

    const handle = (bytes) => {
        let result = bytes / 1000;

        if(result >= 1000) {
            n++;
            result = handle(result);
        }

        return result;
    }

    return chalk.grey(`${handle(bytes)} ${SUFFIXS[n]}`);
}