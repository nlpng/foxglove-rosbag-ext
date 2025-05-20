# foxglove-rosbag-ext

A [Foxglove](https://foxglove.dev) extension that provides remote control of ROS bag recordings. This extension allows you to manage rosbag recordings directly from the Foxglove Studio interface, making it easier to capture data from remote robots.

## Features

- **Remote Recording Control**: Start and stop rosbag recordings from within Foxglove Studio
- **Topic Selection**: Choose which ROS topics to record
- **Recording Status**: Real-time feedback on recording status with duration timer
- **File Management**: Specify output directory and bag name
- **Recording History**: View list of saved recordings with timestamps
- **Modern UI**: Clean, dark-themed interface that matches Foxglove's design language

## Requirements

- Foxglove Studio
- A companion ROS node running on the target system (where recordings will be saved)

## ROS Integration

The extension interacts with the following ROS parameters:

- `/data_recording/bag_name`: Name of the rosbag file
- `/data_recording/output_directory`: Directory where rosbag files will be saved
- `/data_recording/topics`: List of topics to record

These parameters should be managed by your companion ROS node on the recording system.

## Installation

Extension development uses the `npm` package manager to install development dependencies and run build scripts.

To install extension dependencies, run `npm` from the root of the extension package.

```sh
npm install
```

To build and install the extension into your local Foxglove desktop app, run:

```sh
npm run local-install
```

Open the Foxglove desktop (or `ctrl-R` to refresh if it is already open). Your extension is installed and available within the app.

## Usage

1. Open Foxglove Studio
2. Add the "ROS Bag Recording" panel to your layout
3. Configure the recording settings:
   - Enter a name for your bag file
   - Specify the output directory on the remote system
   - Select the topics you want to record
4. Click "Start Recording" to begin capturing data
5. Monitor the recording status and duration
6. Click "Stop Recording" when finished

The saved recordings will be stored in the specified output directory on the system where your ROS node is running.

## Package

Extensions are packaged into `.foxe` files. These files contain the metadata (package.json) and the build code for the extension.

Before packaging, make sure to set `name`, `publisher`, `version`, and `description` fields in _package.json_. When ready to distribute the extension, run:

```sh
npm run package
```

This command will package the extension into a `.foxe` file in the local directory.

## Publish

You can publish the extension to the public registry or privately for your organization.

See documentation here: https://docs.foxglove.dev/docs/visualization/extensions/publish/#packaging-your-extension
