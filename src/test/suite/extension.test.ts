import * as assert from 'assert';
import { before, after } from 'mocha';
import * as vscode from 'vscode';
import { FileSync, Mapping } from '../../fileSync';

suite('Extension Test Suite', () => {
	let fs: FileSync;
	let fsconfig = vscode.workspace.getConfiguration("filesync");
	let origMaps: Mapping[];
	let rootPath: string = __dirname + "\\TestBed"; // __dirname = "c:\Projects\FileSync\out\test\suite\TestBed"
	let testbed = {
		"folder": function(loc: string): vscode.Uri { return vscode.Uri.file(rootPath+"\\"+loc+"\\Orange"); }
		,"file": function(loc: string): vscode.Uri { return vscode.Uri.file(this.folder(loc).fsPath + "\\test.htm"); }
	};
	let scream = function(ah: any){ if(false) { console.log("scream: " + (ah ? ah : "√")); } };
	let sleep = function(ms: number){ return new Promise(r => setTimeout(r,ms)); };

	before(async () => {
		let fsExt = vscode.extensions.getExtension<FileSync>('catstarwind.filesync');
		if(fsExt){
			fs = fsExt.exports;
			fs.debug = false;
		} else {
			throw Error("Catastrophic.");
		}

		//Build TestBed
		await vscode.workspace.fs.createDirectory(testbed.folder("dev")).then(scream, scream);
		await vscode.workspace.fs.delete(testbed.folder("stage"), {recursive: true}).then(scream, scream);
		let wse = new vscode.WorkspaceEdit();
		wse.createFile(testbed.file("dev"), {overwrite: true });
		await vscode.workspace.applyEdit(wse).then(scream,scream);

		//Get current mappings and save them.
		origMaps = fsconfig.get<Mapping[]>("mappings") || <Mapping[]>[];

		//Update mappings for tests.
		await fsconfig.update("mappings", [{"source": rootPath+"\\Dev\\Orange", "destination": rootPath+"\\Stage\\Orange"}], true)
			.then(scream,scream);

		//Ok, let's jam
		vscode.window.showInformationMessage('Start all tests.');
	});

	after(async () => {
		//Bring back original mappings
		await fsconfig.update("mappings", origMaps, true).then(scream,scream);
	});

	test('Mapped Folder Enabled', () => {
		assert.strictEqual(vscode.workspace.name, "Orange");
		assert.ok(fs.enabled);
	});

	test('Mapped Folder Sync', async function() {
		this.timeout(5000);

		//Dirty the file
		await vscode.window.showTextDocument(testbed.file("dev")).then(async editor => {
			await editor.edit(builder => {
				builder.insert((new vscode.Position(0,0)), "<html></html>");
			}).then(scream,scream);
		},scream);

		//Save to trigger the Sync
		await vscode.workspace.saveAll().then(scream,scream);
		await sleep(1000);

		//Check destination
		await vscode.workspace.fs.stat(testbed.file("stage")).then(file => {
			assert.ok(file.size > 0);
		}, err => {
			assert.fail(err.message);
		});
	});
});
