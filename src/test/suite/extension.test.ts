import * as assert from 'assert';
import { before, after } from 'mocha';
import * as vscode from 'vscode';
import { FileSync, Mapping } from '../../fileSync';
import { TextEncoder } from 'util';

suite('Extension Test Suite', () => {
	let fs: FileSync;
	let fsconfig: vscode.WorkspaceConfiguration;
	let origMaps: Mapping[];
	let rootPath: string = __dirname + "\\TestBed"; // __dirname = "c:\Projects\FileSync\out\test\suite\TestBed"
	let devOrange: vscode.Uri = vscode.Uri.file(rootPath+"\\Dev\\Orange");
	let stageOrange:  vscode.Uri = vscode.Uri.file(rootPath+"\\Stage\\Orange");
	let scream = function(ah: any){ console.log("scream: " + (ah ? ah : "√")); };


	before(async () => {
		let fsExt = vscode.extensions.getExtension<FileSync>('catstarwind.filesync');
		if(fsExt){
			fs = fsExt.exports;
			fs.debug = false;
		} else {
			throw Error("Catastrophic.");
		}

		//Build TestBed
		await vscode.workspace.fs.createDirectory(devOrange)
			.then(scream, scream);
		let edit = new vscode.WorkspaceEdit();
		edit.createFile(vscode.Uri.file(devOrange+"\\test.htm"), {ignoreIfExists: true, overwrite:true});
		await vscode.workspace.applyEdit(edit).then(scream,scream);
		await vscode.workspace.fs.writeFile(vscode.Uri.file(devOrange+"\\test.htm"), (new TextEncoder()).encode("<html></html>"))
			.then(scream, scream);
		await vscode.workspace.fs.delete(stageOrange, {recursive: true})
			.then(scream, scream);

		//Get current mappings and save them.
		fsconfig = vscode.workspace.getConfiguration("filesync");
		origMaps = fsconfig.get<Mapping[]>("mappings") || <Mapping[]>[];

		//Update mappings for tests.
		await fsconfig.update("mappings", [{"source": rootPath+"\\Dev\\Orange", "destination": rootPath+"\\Stage\\Orange"}], true)
			.then(scream,scream);

		//Ok, let's jam
		vscode.window.showInformationMessage('Start all tests.');
	});

	after(async () => {
		//Bring back original mappings
		await fsconfig.update("mappings", origMaps, true)
			.then(scream,scream);
	});

	test('Mapped Folder Enabled', () => {
		assert.ok(fs.enabled);
	});

	test('Mapped Folder Sync', async () => {
		let testDoc: vscode.TextDocument = await vscode.workspace.openTextDocument("test.htm").then(scream,scream).then();
		let editor = vscode.window.activeTextEditor;
		if(editor){
			await editor.edit(eb => {
				eb.insert((new vscode.Position(0,5)),"<p>hi</p>");
			}).then(scream,scream);
		} else {
			assert.fail("No Editor");
		}

		await testDoc.save().then(scream, scream);
	});

});
