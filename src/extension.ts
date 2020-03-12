
import 'path'

import {exec} from 'child_process'
import * as vscode from 'vscode';

declare type Callback = (out: string) => void;

let myStatusBarItem: vscode.StatusBarItem;

export function activate({subscriptions}: vscode.ExtensionContext) {
  console.log('yay starting extension :D')
  // register a command that is invoked when the status bar
  // item is selected
  const myCommandId = 'cmdStatus.updateItem';
  subscriptions.push(
      vscode.commands.registerCommand(myCommandId, updateStatusBarItem));

  // create a new status bar item that we can now manage
  myStatusBarItem =
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  myStatusBarItem.command = myCommandId;
  subscriptions.push(myStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  let conf = vscode.workspace.getConfiguration('cmdStatus')
  let interval = conf.get<number>('interval');
  if (interval == undefined) {
    console.error('undefined interval')
  } else {
    setInterval(updateStatusBarItem, 1000 * interval)
  }

  // update status bar item once at start
  updateStatusBarItem();
}

function run_custom_cmd(callback: Callback) {
  let conf = vscode.workspace.getConfiguration('cmdStatus')
  let cmd = conf.get<string>('command')
  if (cmd == undefined) {
    console.error('undefined command')
  }
  else {
    exec_cmd(cmd, callback)
  }
}

function exec_cmd(cmd: string, callback: Callback) {
  let cwd = vscode.workspace.workspaceFolders == undefined ?
      '' :
      vscode.workspace.workspaceFolders[0].uri.path;

  exec(cmd, {cwd: cwd}, (error, stdout, stderr) => {
    if (error) {
      callback(`error: ${error.message}`);
    } else if (stderr) {
      callback(`stderr: ${stderr}`);
    } else {
      callback(stdout.trim());
    }
  })
}

function updateStatusBarItem(): void {
  run_custom_cmd((result) => {
    console.log(result);
    myStatusBarItem.text = '[ ' + result + ' ]';
    myStatusBarItem.show();
  });
}