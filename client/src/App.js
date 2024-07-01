import { useEffect, useRef, useState } from "react";
import { useExternalScript } from "./helpers/ai-sdk/externalScriptsLoader";
import { getAiSdkControls } from "./helpers/ai-sdk/loader";
import './App.css';

import GenderComponent from "./components/GenderComponent";
import AgeComponent from "./components/AgeComponent";
import DominantEmotionComponent from "./components/DominantEmotionComponent";
import FeatureComponent from "./components/FeatureComponent";
import EngagementComponent from "./components/EngagementComponent";
import FaceTrackerComponent from "./components/FaceTrackerComponent";
import MoodComponent from "./components/MoodComponent";
import EmotionBarsComponent from "./components/EmotionBarsComponent";

function App() {
  const mphToolsState = useExternalScript("https://sdk.morphcast.com/mphtools/v1.0/mphtools.js");
  const aiSdkState = useExternalScript("https://ai-sdk.morphcast.com/v1.16/ai-sdk.js");
  const videoEl = useRef(undefined);

  const [generatedAudio, setGeneratedAudio] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [waitAudio, setWaitAudio] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, wait_audio: waitAudio })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      setGeneratedAudio(data);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const handleChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleWaitAudioChange = (event) => {
    setWaitAudio(event.target.checked);
  };

  useEffect(() => {
    videoEl.current = document.getElementById("videoEl");
    async function getAiSdk() {
      if (aiSdkState === "ready" && mphToolsState === "ready") {
        const { source, start } = await getAiSdkControls();
        await source.useCamera({
          toVideoElement: document.getElementById("videoEl"),
        });
        await start();
      }
    }
    getAiSdk();
  }, [aiSdkState, mphToolsState]);

  return (
      <div className="App">
        <header className="App-header">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "640px", height: "480px", position: "relative" }}>
              <video id="videoEl"></video>
              <FaceTrackerComponent videoEl={videoEl}></FaceTrackerComponent>
            </div>
            <GenderComponent></GenderComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <DominantEmotionComponent></DominantEmotionComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <AgeComponent></AgeComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <FeatureComponent></FeatureComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <EngagementComponent></EngagementComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <MoodComponent></MoodComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>
            <EmotionBarsComponent></EmotionBarsComponent>
            <hr className="solid" style={{ width: "100%" }}></hr>

            <form onSubmit={handleSubmit} className="form-container">
            <textarea
                value={prompt}
                onChange={handleChange}
                placeholder="Enter your music prompt..."
                rows={4}
                className="border p-2 w-full"
            />
              <label className="block mt-4">
                <input
                    type="checkbox"
                    checked={waitAudio}
                    onChange={handleWaitAudioChange}
                    className="mr-2"
                />
                Wait for audio
              </label>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
                Generate Music
              </button>

              {generatedAudio.length > 0 && (
                  <div className="mt-4">
                    <h2>Generated Audio:</h2>
                    <ul>
                      {generatedAudio.map((audio, index) => (
                          <li key={index}>
                            <p>Title: {audio.title}</p>
                            <audio controls>
                              <source src={audio.audio_url} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </form>
          </div>
        </header>
      </div>
  );
}

export default App;
