import { ExtensionContext } from "@foxglove/extension";

import { initRosbagPanel } from "./RosbagPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "rosbag-panel", initPanel: initRosbagPanel });
}
