import { Immutable, PanelExtensionContext, Topic, PanelExtensionContext as PanelContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type PanelState = {
  bagName: string;
  outputDirectory: string;
  selectedTopics: string[];
  isRecording: boolean;
  recordingStartTime: number | null;
  savedBags: Array<{
    name: string;
    size: string;
    timestamp: string;
  }>;
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function RosbagPanel({ context }: { context: PanelContext }): ReactElement {
  const [topics, setTopics] = useState<undefined | Immutable<Topic[]>>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [recordingDuration, setRecordingDuration] = useState<string>("00:00:00");
  const [state, setState] = useState<PanelState>({
    bagName: "",
    outputDirectory: "",
    selectedTopics: [],
    isRecording: false,
    recordingStartTime: null,
    savedBags: [],
  });

  // Handle recording duration timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (state.isRecording && state.recordingStartTime) {
      intervalId = setInterval(() => {
        const duration = Date.now() - state.recordingStartTime!;
        setRecordingDuration(formatDuration(duration));
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.isRecording, state.recordingStartTime]);

  // Set up render handling and parameter watching
  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setTopics(renderState.topics);

      // Watch for parameter changes
      const bagName = renderState.parameters?.get("/data_recording/bag_name") as string | undefined;
      const outputDir = renderState.parameters?.get("/data_recording/output_directory") as string | undefined;
      const topicList = renderState.parameters?.get("/data_recording/topics") as string[] | undefined;

      if (bagName || outputDir || topicList) {
        setState((prev) => ({
          ...prev,
          bagName: bagName ?? prev.bagName,
          outputDirectory: outputDir ?? prev.outputDirectory,
          selectedTopics: topicList ?? prev.selectedTopics,
        }));
      }
    };

    // Watch for topics and parameters
    context.watch("topics");
    context.watch("parameters");
    
    // Subscribe to recording status topic
    context.subscribe([{ topic: "/data_recording/status" }]);

  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  const handleStartRecording = () => {
    // Set parameters
    context.setParameter("/data_recording/bag_name", { value: state.bagName });
    context.setParameter("/data_recording/output_directory", { value: state.outputDirectory });
    context.setParameter("/data_recording/topics", { value: state.selectedTopics });
    
    setState((prev) => ({
      ...prev,
      isRecording: true,
      recordingStartTime: Date.now(),
    }));
  };

  const handleStopRecording = () => {
    setState((prev) => {
      const newBag = {
        name: prev.bagName,
        size: "Calculating...",
        timestamp: new Date().toLocaleString(),
      };
      return {
        ...prev,
        isRecording: false,
        recordingStartTime: null,
        savedBags: [newBag, ...prev.savedBags],
      };
    });
  };

  return (
    <div style={{ 
      padding: "1rem",
      height: "100%",
      backgroundColor: "rgba(30, 30, 30, 0.95)",
      color: "#e0e0e0",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      {/* Status Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem",
        backgroundColor: "rgba(40, 40, 40, 0.9)",
        borderRadius: "4px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <div style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: state.isRecording ? "#4CAF50" : "#666",
            boxShadow: state.isRecording ? "0 0 8px #4CAF50" : "none",
          }} />
          <span>{state.isRecording ? "Recording" : "Ready"}</span>
        </div>
        {state.isRecording && (
          <div style={{ fontFamily: "monospace", fontSize: "1.1em" }}>
            {recordingDuration}
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      <div style={{
        backgroundColor: "rgba(40, 40, 40, 0.9)",
        borderRadius: "4px",
        padding: "1rem",
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#4CAF50" }}>Recording Configuration</h3>
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Bag Name
              <input
                type="text"
                value={state.bagName}
                onChange={(e) => setState((prev) => ({ ...prev, bagName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(60, 60, 60, 0.9)",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  marginTop: "0.25rem",
                }}
              />
            </label>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Output Directory
              <input
                type="text"
                value={state.outputDirectory}
                onChange={(e) => setState((prev) => ({ ...prev, outputDirectory: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "rgba(60, 60, 60, 0.9)",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  marginTop: "0.25rem",
                }}
              />
            </label>
          </div>
        </div>

        {/* Topics Selection */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Topics to Record
          </label>
          <div style={{
            maxHeight: "150px",
            overflowY: "auto",
            backgroundColor: "rgba(60, 60, 60, 0.9)",
            border: "1px solid #666",
            borderRadius: "4px",
            padding: "0.5rem",
          }}>
            {(topics ?? []).map((topic) => (
              <div key={topic.name} style={{
                display: "flex",
                alignItems: "center",
                padding: "0.25rem 0",
              }}>
                <input
                  type="checkbox"
                  checked={state.selectedTopics.includes(topic.name)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setState((prev) => ({
                      ...prev,
                      selectedTopics: isChecked
                        ? [...prev.selectedTopics, topic.name]
                        : prev.selectedTopics.filter((t) => t !== topic.name),
                    }));
                  }}
                  style={{ marginRight: "0.5rem" }}
                />
                <span style={{ fontSize: "0.9em" }}>{topic.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={state.isRecording ? handleStopRecording : handleStartRecording}
            disabled={!state.isRecording && (!state.bagName || !state.outputDirectory || state.selectedTopics.length === 0)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: state.isRecording ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.2s",
              opacity: (!state.isRecording && (!state.bagName || !state.outputDirectory || state.selectedTopics.length === 0)) ? "0.5" : "1",
            }}
          >
            {state.isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{
            padding: "0.75rem",
            backgroundColor: "rgba(60, 60, 60, 0.9)",
            borderRadius: "4px",
            fontSize: "0.9em",
          }}>
            {state.selectedTopics.length} topics selected
          </div>
        </div>
      </div>

      {/* Saved Recordings List */}
      <div style={{
        flex: 1,
        backgroundColor: "rgba(40, 40, 40, 0.9)",
        borderRadius: "4px",
        padding: "1rem",
        overflowY: "auto",
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#4CAF50" }}>Saved Recordings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {state.savedBags.map((bag, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem",
              backgroundColor: "rgba(60, 60, 60, 0.9)",
              borderRadius: "4px",
              fontSize: "0.9em",
            }}>
              <span>{bag.name}</span>
              <span style={{ color: "#888" }}>{bag.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function initRosbagPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<RosbagPanel context={context} />);
  return () => {
    root.unmount();
  };
}
