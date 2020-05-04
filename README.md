# FileSync
Visual Studio Code extentsion to synchronize files when saving between a workspace folder and one or many outside folders.

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
			{ "path": "Y:\\Stage\\Orange", "name": "Stage", "active": true }
			, {"path": "Z:\\Live\\Orange", "name": "Live", "active": false }
			, "X:\\Test\\Orange"
		]
	}
]
```

File Sync status bar.

![fs-statusbar_active](https://raw.githubusercontent.com/CatStarwind/FileSync/master/res/fs-statusbar_active.png)
![fs-statusbar_syncing](https://raw.githubusercontent.com/CatStarwind/FileSync/master/res/fs-statusbar_syncing.png)

## Requirements
None.

## Extension Settings
* `filesync.mappings`: An array of mappings to sync one `source` folder across to one or multiple `destination` folders.

### Single Destination Mapping
```json
{ "source": "C:\\Dev\\Apple", "destination": "Z:\\Stage\\Apple" }
```
* `source`: *String* - Root path of your workspace folder. Any files saved will be copied out to the `destination`.
* `desitnation`: *String* - Path of folder to keep in sync with workspace folder (`source`).

### Multi-Destination Mapping
```json
{
	"source": "C:\\Dev\\Apple"
	, "destination": [
		"Z:\\Stage\\Apple"
		,{
			"path": "Y:\\Live\\Apple"
			,"name": "Live"
			,"active": false
		}
	]
}
```
* `source`: *String* - Root path of your workspace folder. Any files saved will be copied out to all `destination`s defined.
* ``destination``: *Array* of destinations, either **simple** or **complex**.
  * **simple**: *String* - Path of folder to keep in sync with workspace folder (`source`).
  * **complex**: *Object* - Defines a ``path``, ``name`` and if destination is ``active`` or disabled.
    * ``path``: *String* - Path of folder to keep in sync with workspace folder (`source`).
    * ``name``: *String* - Name of destination.
    * ``active``: *Boolean* - Determines if destination will be synced to. ``true`` will copy files to destination, ``false`` will disable destination.

## Known Issues
None currently known. Please [submit a ticket](https://github.com/CatStarwind/FileSync/issues/new) if any are encountered.

## Release Notes

### [1.1.0] - 2020-05-04
#### Added
- Workspace folders support.

### [1.0.0] - 2019-10-08
#### Added
- Multi-destination support.

[1.1.0]: https://github.com/CatStarwind/FileSync/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/CatStarwind/FileSync/releases/tag/v1.0.0