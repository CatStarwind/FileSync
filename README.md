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

## Requirements

None.

## Extension Settings

* `filesync.mappings`: An array of mappings to sync one `source` folder across one or multiple `destination` folders.

#### Single Destination Mapping
```json
{ "source": "C:\\Dev\\Apple", "destination": "Z:\\Stage\\Apple" }
```
* `source`: Root path of your workspace folder. Any files saved will be copied out to the `destination`.
* `desitnation`: Path of folder to keep in sync with workspace folder (`source`).

## Known Issues

Only simple mappings currently supported.

## Release Notes

### 0.1.0

Initial release of FileSync.
