import * as vscode from 'vscode';

interface Destination {
	path: string;
	name: string;
}

export interface Mapping {
	source: string;
	destination: string | string[] | Destination[];
}

export class FileSync {
	context: vscode.ExtensionContext;
	enabled: boolean;
	debug: boolean;
	onSave: vscode.Disposable;
	channel: vscode.OutputChannel;
	//sbar: vscode.StatusBarItem;

	constructor(context: vscode.ExtensionContext){
		this.context = context;
		this.enabled = false;
		this.debug = true;
		this.onSave = <vscode.Disposable>{};

		//Set up log output
		this.channel = vscode.window.createOutputChannel("FileSync");
		context.subscriptions.push(this.channel);

		/*
		//Set up status bar
		this.sbar = vscode.window.createStatusBarItem();
		context.subscriptions.push(this.sbar);
		*/

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
					this.onSave = vscode.workspace.onDidSaveTextDocument((file) => { if(map){ this.syncSave(map, file); } });
					this.context.subscriptions.push(this.onSave);
					this.enabled = true;
					vscode.window.showInformationMessage("File Sync is Active.");
					this.log(`Save listener enabled for ${map.source}.`);
				} else {
					if(!auto) { vscode.window.showErrorMessage("No mapping available!"); }
					this.log(`Failed! ${root} not mapped.`);
				}

			} else { this.log("Aborting, not in a workspace."); }

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

	syncSave(map: Mapping, file: vscode.TextDocument){

		//Check if saved file is part of Map
		if(file.fileName.toLowerCase().startsWith(map.source.toLowerCase())){
			let filePath: string = file.fileName.substr(map.source.length);

			//Determine Destination
			if(typeof map.destination === "string"){
				//Single Destination
				let dest = vscode.Uri.file(map.destination + filePath);

				this.log(`Attempting ${file.fileName} -> ${dest.fsPath}`);
				vscode.workspace.fs.copy(file.uri, dest, {overwrite: true})
					.then(val => {
						/*
						this.sbar.color = "statusBarItem.prominentForeground";
						this.sbar.text = `$(sync) ${file.fileName} has been synced -> ${dest.fsPath}`;
						this.sbar.show();
						setTimeout(() => {this.sbar.hide();} , 5*1000);
						*/
						this.log("Success");
						vscode.window.setStatusBarMessage(`$(file-symlink-file) ${file.fileName} synced to ${dest.fsPath}`, 5*1000);
					}, err => { this.log("Error:\t"+err.message); vscode.window.showErrorMessage("Error:\t"+err.message); });
					//}, (...args) => { console.log(args); });
			} else if(Array.isArray(map.destination)){
				//Multi Destination
				for (let dest of map.destination){
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
		this.channel.appendLine(msg);
	}
}