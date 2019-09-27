import * as vscode from 'vscode';
import { FileSync } from './fileSync';

export function activate(context: vscode.ExtensionContext) {
	console.log('FileSync Activated.');
	let filesync = new FileSync(context);

	//Vroom
	filesync.enable(true);
}

// this method is called when your extension is deactivated
export function deactivate() {}