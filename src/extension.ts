import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('FileSync Activated.');

	interface Destination {
		path: string;
		name: string;
	}

	interface Mapping {
		source: string;
		destination: string | string[] | Destination[];
	}

	// Refresh FileSync on Config change.
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((config)=>{
		if(config.affectsConfiguration("filesync")){
			filesync.log("FileSync configuration modified. Reloading...");
			filesync.disable();
			filesync.enable();
		}
	}));

	let filesync = {
		"enabled": false
		,"debug": true
		,"onSave": <vscode.Disposable>{}
		,"enable": function() {
			if(!this.enabled){
				this.log("Enabling save listener...");

				//Check if workspace.
				let root = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
				if(root !== ""){
					//Look for mapping.
					let map = this.mappings().find(m => m.source.toLowerCase() === root.toLowerCase());

					if(map){
						//Mapping found, enable FileSync for map.
						this.onSave = vscode.workspace.onDidSaveTextDocument(this.syncSave, map);
						context.subscriptions.push(this.onSave);
						this.enabled = true;
						this.log("Save listener enabled.");
					} else {
						vscode.window.showErrorMessage("No mapping available! File Sync disabled.");
						this.log("Failed! Not mapped.");
					}

				} else { this.log("Aborting, not a workspace."); }

			} else {
				this.log("Save listener already enabled.");
			}
		}
		,"disable": function() {
			if(this.enabled){
				this.log("Disabling save listener.");
				this.onSave.dispose();
				this.enabled = false;
			} else {
				this.log("Save listener already disabled.");
			}
		}
		,"syncSave": function(this:Mapping, file: vscode.TextDocument){
			//Check if saved file is part of Map
			if(file.fileName.toLowerCase().startsWith(this.source.toLowerCase())){
				let filePath: string = file.fileName.substr(this.source.length);

				//Figure out Destination
				if(typeof this.destination === "string"){
					//Single Destination
					let dest = vscode.Uri.file(this.destination + filePath);

					filesync.log(`Sync Attempt: ${file.fileName} -> ${dest.fsPath}`);
					vscode.workspace.fs.copy(file.uri, dest, {overwrite: true})
						.then(val => {
							/*
							this.sbar.color = "statusBarItem.prominentForeground";
							this.sbar.text = `$(sync) ${file.fileName} has been synced -> ${dest.fsPath}`;
							this.sbar.show();
							setTimeout(() => {this.sbar.hide();} , 5*1000);
							*/
							filesync.log(`Synced: ${file.fileName} -> ${dest.fsPath}`);
							vscode.window.setStatusBarMessage(`$(file-symlink-file) ${file.fileName} synced to ${dest.fsPath}`, 5*1000);
						}, err => { console.log(err); vscode.window.showErrorMessage("Error Syncing", err); });
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
		,"mappings": function(): Mapping[] {
			let maps = vscode.workspace.getConfiguration('filesync').get<Mapping[]>('mappings');
			if(!maps){this.log("No mappings set."); }
			return maps ? maps : new Array<Mapping>();
		}
		,"sbar": vscode.window.createStatusBarItem()
		,"log": function(msg: any) {
			if(filesync.debug) { console.log("FileSync:", msg); }
		}
	};

	// Register Enable command.
	context.subscriptions.push(vscode.commands.registerCommand('filesync.enable', filesync.enable, filesync));
	// Register Disable command.
	context.subscriptions.push(vscode.commands.registerCommand('filesync.disable', filesync.disable, filesync));

	//Vroom
	filesync.enable();
}

// this method is called when your extension is deactivated
export function deactivate() {}