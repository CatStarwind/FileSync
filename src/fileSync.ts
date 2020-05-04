import * as vscode from 'vscode';

interface Destination {
	path: string;
	name: string;
	active: boolean;
}

export interface Mapping {
	source: string;
	destination: string | string[] | Destination[];
}

export class FileSync {
	context: vscode.ExtensionContext;
	enabled: boolean;
	debug: boolean;
	onSave: Array<{root: string, save: vscode.Disposable}>;
	channel: vscode.OutputChannel;
	sbar: vscode.StatusBarItem;

	constructor(context: vscode.ExtensionContext){
		this.context = context;
		this.enabled = false;
		this.debug = true;
		this.onSave = [];

		//Set up log output
		this.channel = vscode.window.createOutputChannel("FileSync");
		context.subscriptions.push(this.channel);

		//Set up status bar
		this.sbar = vscode.window.createStatusBarItem();
		this.sbar.text = "$(file-symlink-file)";
		this.sbar.tooltip = "File Sync is Active";
		context.subscriptions.push(this.sbar);

		// Refresh FileSync on Config change.
		context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((config) => {
			if(config.affectsConfiguration("filesync")){
				this.log("FileSync configuration modified. Reloading...");
				this.disable();
				this.enable();
			}
		}));

		// Listen for Workspace folder changes.
		context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((folderChanges) => {
			// Create save listener for each new folder.
			folderChanges.added.forEach(this.createListener, this);

			// Remove save listener for removed folders.
			folderChanges.removed.forEach((folder) => {
				//Get listener index.
				let l = this.onSave.findIndex(listener => listener.root.toLowerCase() === folder.uri.fsPath.toLowerCase());
				if(l >= 0) {
					// Dispose and remove.
					this.onSave[l].save.dispose();
					this.onSave.splice(l, 1);
					this.log(`Removed Listener: ${folder.uri.fsPath}`);
				}
			});
		}));

		// Register Enable command.
		context.subscriptions.push(vscode.commands.registerCommand('filesync.enable', this.enable, this));
		// Register Disable command.
		context.subscriptions.push(vscode.commands.registerCommand('filesync.disable', this.disable, this));
	}

	enable() {
		if(!this.enabled){
			this.log("Enabling save listener...");
			//Check if workspace.
			if (vscode.workspace.workspaceFolders) {
				// Iterate through the folders in the workspace.
				vscode.workspace.workspaceFolders.forEach(this.createListener, this);
				this.enabled = true;
				this.sbar.show();
				vscode.window.showInformationMessage("File Sync is Active.");
			} else {
				this.log("Aborting, not in a workspace.");
			}
		} else {
			this.log("Save listener already enabled.");
		}
	}

	createListener(folder:vscode.WorkspaceFolder) {
		let root = folder.uri.fsPath;
		this.log(`Checking ${root}...`);

		//Look for mapping.
		let map = this.mappings().find(m => m.source.toLowerCase() === root.toLowerCase());
		if(map){
			//Mapping found, enable FileSync for map.
			let save = vscode.workspace.onDidSaveTextDocument((file) => { if(map){ this.syncSave(map, file); } });
			this.onSave.push({'root':root, 'save':save});
			this.context.subscriptions.push(save);
			this.log(`Save listener enabled for ${map.source}.`);
		} else {
			vscode.window.showWarningMessage(`No mapping found for ${root}.`,);
			this.log(`Failed! ${root} not mapped.`);
		}
	}

	disable() {
		if(this.enabled){
			this.log("Disabling save listener.");
			this.onSave.forEach(listener => listener.save.dispose());
			this.enabled = false;
			this.sbar.hide();
		} else {
			this.log("Save listener already disabled.");
		}
	}

	mappings(): Mapping[] {
		let maps = vscode.workspace.getConfiguration('filesync').get<Mapping[]>('mappings');
		if(!maps){this.log("No mappings set."); }
		return maps ? maps : new Array<Mapping>();
	}

	syncSave(map: Mapping, file: vscode.TextDocument){
		//Check if saved file is part of Map
		if(file.fileName.toLowerCase().startsWith(map.source.toLowerCase())){
			let filePath: string = file.fileName.substr(map.source.length);

			//Determine Destination
			if(typeof map.destination === "string"){
				//Single Destination
				this.syncFile(file, vscode.Uri.file(map.destination + filePath));

			} else if(Array.isArray(map.destination)){
				//Multi Destination
				for (let dest of map.destination){
					if(typeof dest === "string"){
						//Simple Destination
						this.syncFile(file, vscode.Uri.file(dest + filePath));

					} else if(dest.active) {
						//Complex Destination
						this.syncFile(file, vscode.Uri.file(dest.path + filePath));
					}
				}
			}
		}
	}

	syncFile(file: vscode.TextDocument, dest: vscode.Uri){
		this.log(`Attempting ${file.fileName} -> ${dest.fsPath}`);
		vscode.workspace.fs.copy(file.uri, dest, {overwrite: true})
			.then(() => {
				this.log(`Success! (${dest.fsPath})`);
				this.sbar.text = this.sbar.text + (this.sbar.text === "$(file-symlink-file)" ? ` ${file.fileName} synced to ${dest.fsPath}` : ` & ${dest.fsPath}` );
				setTimeout(() => { this.sbar.text = "$(file-symlink-file)";}, 5*1000);
			}, err => { this.log(`Failed! (${dest.fsPath})\n↳\t${err.message}`); vscode.window.showErrorMessage(err.message); });
	}

	log(msg: any) {
		if(this.debug) { console.log("FileSync:", msg); }
		this.channel.appendLine(msg);
	}
}