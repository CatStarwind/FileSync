import * as vscode from 'vscode';

interface Destination {
	path: string;
	name: string;
}

interface Mapping {
	source: string;
	destination: string | string[] | Destination[];
}

export class FileSync {
	context: vscode.ExtensionContext;
	enabled: boolean;
	debug: boolean;
	onSave: vscode.Disposable;

	constructor(context: vscode.ExtensionContext){
		this.context = context;
		this.enabled = false;
		this.debug = true;
		this.onSave = <vscode.Disposable>{};

		// Refresh FileSync on Config change.
		context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((config)=>{
			if(config.affectsConfiguration("filesync")){
				this.log("FileSync configuration modified. Reloading...");
				this.disable();
				this.enable(true);
			}
		}));

		// Register Enable command.
		context.subscriptions.push(vscode.commands.registerCommand('filesync.enable', this.enable, this));
		// Register Disable command.
		context.subscriptions.push(vscode.commands.registerCommand('filesync.disable', this.disable, this));

	}

	enable(auto:boolean = false) {
		if(!this.enabled){
			this.log("Enabling save listener...");

			//Check if workspace/folder.
			let root = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
			if(root !== ""){
				//Look for mapping.
				let map = this.mappings().find(m => m.source.toLowerCase() === root.toLowerCase());

				if(map){
					//Mapping found, enable FileSync for map.
					this.onSave = vscode.workspace.onDidSaveTextDocument(this.syncSave, map);
					this.context.subscriptions.push(this.onSave);
					this.enabled = true;
					vscode.window.showInformationMessage("File Sync is Active.");
					this.log("Save listener enabled.");
				} else {
					if(!auto) { vscode.window.showErrorMessage("No mapping available!"); }
					this.log("Failed! Not mapped.");
				}

			} else { this.log("Aborting, not a workspace."); }

		} else {
			this.log("Save listener already enabled.");
		}
	}

	disable() {
		if(this.enabled){
			this.log("Disabling save listener.");
			this.onSave.dispose();
			this.enabled = false;
		} else {
			this.log("Save listener already disabled.");
		}
	}

	mappings(): Mapping[] {
		let maps = vscode.workspace.getConfiguration('filesync').get<Mapping[]>('mappings');
		if(!maps){this.log("No mappings set."); }
		return maps ? maps : new Array<Mapping>();
	}

	syncSave(this:Mapping, file: vscode.TextDocument){
		//Check if saved file is part of Map
		if(file.fileName.toLowerCase().startsWith(this.source.toLowerCase())){
			let filePath: string = file.fileName.substr(this.source.length);

			//Figure out Destination
			if(typeof this.destination === "string"){
				//Single Destination
				let dest = vscode.Uri.file(this.destination + filePath);

				console.log(`FileSync: Attempting ${file.fileName} -> ${dest.fsPath}`);
				vscode.workspace.fs.copy(file.uri, dest, {overwrite: true})
					.then(val => {
						/*
						this.sbar.color = "statusBarItem.prominentForeground";
						this.sbar.text = `$(sync) ${file.fileName} has been synced -> ${dest.fsPath}`;
						this.sbar.show();
						setTimeout(() => {this.sbar.hide();} , 5*1000);
						*/
						console.log("FileSync: Success");
						vscode.window.setStatusBarMessage(`$(file-symlink-file) ${file.fileName} synced to ${dest.fsPath}`, 5*1000);
					}, err => { console.log(err); vscode.window.showErrorMessage("Error Syncing:\n"+err.message); });
					//}, (...args) => { console.log(args); });

			} else if(Array.isArray(this.destination)){
				//Multi Destination
				for (let dest of this.destination){
					if(typeof dest === "string"){
						//Simple Destination
					} else {
						//Complex Destination
					}
				}
			}
		}
	}

	log(msg: any) {
		if(this.debug) { console.log("FileSync:", msg); }
	}
}