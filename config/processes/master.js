'use strict';

const _ = require('lodash');
const os = require('os');

module.exports = function(cluster) {

    // Create a worker per cpu
    let cpuCount = os.cpus().length;

    let debugPort = getDebugPort();
    let inDebug = !!debugPort;
    let workerArgv = process.execArgv.concat();

    if(inDebug) {
        cluster.setupMaster({
            execArgv: workerArgv
        });
        cpuCount = 1;
    }

    const updateDebugPort = (args, value) => {
        for(let i = 0; i < args.length; i++) {
            if(args[i].indexOf('--debug-brk=') === 0) {
                args[i] = '--debug-brk=' + value;
                return;
            }
        }
    };

    console.log('creating', cpuCount, 'workers');
    for(let i = 0; i < cpuCount; ++i) {
        if(inDebug) {
            updateDebugPort(workerArgv, ++debugPort);
        }
        cluster.fork();
    }

    cluster.on('disconnect', function(worker) {
        //console.error('worker disconnected, starting new worker');
        if(inDebug) {
            updateDebugPort(workerArgv, ++debugPort);
        }
        cluster.fork();
    });

    function getDebugPort() {
        let args = process.execArgv;
        for(let i = 0; i < args.length; i++) {
            let arg = args[i];
            if(arg.indexOf('--debug-brk=') === 0) {
                let port = parseInt(arg.replace('--debug-brk=', ''));
                return isNaN(port) ? null : port;
            }
        }
    }

};