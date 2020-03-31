'use strict'

const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const CLIENT = path.resolve(__dirname, './../build/client.js')

// Config
const CLIENT_MAX = 5
const IS_SILENT = false
const DURATION = 0 // milliseconds
const SERVER_ENDPOINT = 'ws://localhost:8888/'

const children = []

process.on('exit', function() {
  console.log('killing', children.length, 'child processes')
  children.forEach(function(child) {
    child.kill()
  })
})

const cleanExit = function() { process.exit() }
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

function sendResult(message) {
    console.log(message)
}

function run() {
    (function recursive(accountIndex) {
        const childEnv = {
          ...process.env,
          SERVER_ENDPOINT,
          CLIENT_ID: accountIndex
        }

        const childArgs = []
        const flags = []

        const child = child_process.fork(CLIENT, childArgs, {
            env: childEnv,
            execArgv: flags.concat(process.execArgv),
            silent: IS_SILENT
        });
        child.on('message', sendResult)
        child.on('close', (code) => {
          // TODO: надо бы убирать процесс из массива child
          if (code) {
            process.exit(code)
          }
        })

        children.push(child)

        setTimeout(() => {
            if (accountIndex + 1 < CLIENT_MAX) {
                recursive(accountIndex + 1)
            }
        }, DURATION)
      })(0)
}

process.nextTick(() => run())