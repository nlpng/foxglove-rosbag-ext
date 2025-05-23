# foxglove-rosbag-ext

A [Foxglove](https://foxglove.dev) extension panel that provides remote control of ROS bag recordings. This extension allows you to manage rosbag recordings directly from the Foxglove Studio interface, making it easier to capture data from remote robots.

## Features

- **Remote Recording Control**: Start and stop rosbag recordings via ROS services from within Foxglove Studio
- **Topic Selection**: Interactive checkbox list to choose which ROS topics to record
- **Real-time Status**: Live recording indicator with duration timer and file size monitoring
- **Configuration Management**: Specify output directory and bag name with persistent UI state
- **Recording History**: View list of completed recordings with timestamps and file sizes
- **Modern UI**: Clean, dark-themed interface that integrates seamlessly with Foxglove's design

## Requirements

- Foxglove Studio
- A companion ROS node running on the target system that implements the required services and publishes status messages

## ROS Integration

### Parameters
The extension reads and writes the following ROS parameters:
- `/data_recording/bag_name`: Name of the rosbag file to create
- `/data_recording/output_directory`: Directory where rosbag files will be saved
- `/data_recording/topics`: Array of topic names to record

### Services
The extension calls these ROS services:
- `/data_recording/start_recording`: Trigger service to begin recording
- `/data_recording/stop_recording`: Trigger service to end recording

### Topics
The extension subscribes to these status topics:
- `/data_recording/bag_size`: std_msgs/Float64 - Current bag file size in bytes
- `/data_recording/duration`: Duration message - Current recording duration

Your companion ROS node should implement these services and publish the status messages.

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
2. Add the "rosbag-panel" panel to your layout (this extension registers a panel named "rosbag-panel")
3. Configure the recording settings:
   - Enter a name for your bag file
   - Specify the output directory on the remote system
   - Use the checkbox list to select which topics you want to record
4. Click "Start Recording" to begin capturing data (button is disabled until all required fields are filled)
5. Monitor the live recording status with:
   - Green recording indicator and status
   - Real-time duration timer (HH:MM:SS format)
   - Current file size updates
6. Click "Stop Recording" when finished

The saved recordings will appear in the "Saved Recordings" list and be stored in the specified output directory on the system where your ROS node is running.

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
