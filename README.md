# FileSync

Visual Studio Code extentsion to synchronize files between a workspace folder and one or many outside folders.

## Features
Multiple mappings supported.
```json
,"filesync.mappings": [
	{ "source": "C:\\Dev\\Apple", "destination": "Z:\\Stage\\Apple"}
	, {
		"source": "C:\\Dev\\Peach"
		, "destination": [ "Y:\\Stage\\Peach", "Z:\\Live\\Peach" ]
	}
	, {
		"source": "C:\\Dev\\Orange"
		,"destination": [
			{ "path": "Y:\\Stage\\Orange", "name": "Stage" }
			, {"path": "Z:\\Live\\Orange", "name": "Live" }
		]
	}
]
```

File Sync Status Bar.

![fs-statusbar_active](https://raw.githubusercontent.com/CatStarwind/FileSync/master/res/fs-statusbar_active.png)

![fs-statusbar_syncing](https://raw.githubusercontent.com/CatStarwind/FileSync/master/res/fs-statusbar_syncing.png)

## Requirements
None.

## Extension Settings
* `filesync.mappings`: An array of mappings to sync one `source` folder across one or multiple `destination` folders.

### Single Destination Mapping
```json
{ "source": "C:\\Dev\\Apple", "destination": "Z:\\Stage\\Apple" }
```
* `source`: Root path of your workspace folder. Any files saved will be copied out to the `destination`.
* `desitnation`: Path of folder to keep in sync with workspace folder (`source`).

## Known Issues

Only single destination mappings currently supported.

## Release Notes

### [0.2.0] - 2019-10-04
#### Added
- Added File Sync status bar to indicate when File Sync is active.
- Added File Sync output channel.

### [0.1.1] - 2019-09-27
#### Changed
- Suppressed 'No Mapping Found' message unless manually enabling File Sync.
- Display message when File Sync is active on a workspace.

### [0.1.0] - 2019-09-23
#### Added
- Support for single destination mapping.

[0.2.0]: https://github.com/CatStarwind/FileSync/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/CatStarwind/FileSync/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/CatStarwind/FileSync/releases/tag/v0.1.0