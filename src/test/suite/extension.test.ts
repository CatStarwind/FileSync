import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { FileSync } from '../../fileSync';

suite('Extension Test Suite', () => {
	let filesync: FileSync;


	before(() => {
		let fsExt = vscode.extensions.getExtension<FileSync>('catstarwind.filesync');
		if(fsExt){
			filesync = fsExt.exports;
			filesync.debug = false;
		} else {
			throw Error("Catastrophic.");
		}
		vscode.window.showInformationMessage('Start all tests.');
	});

	test('Non Mapped Folder', () => {
		assert.ok(!filesync.enabled);
	});
});
