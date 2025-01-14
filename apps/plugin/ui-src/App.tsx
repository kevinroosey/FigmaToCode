import { useEffect, useState } from "react";
import { PluginUI } from "plugin-ui";
import {
  Framework,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  ErrorMessage,
  SettingsChangedMessage,
  Warning,
} from "types";
import { postUISettingsChangingMessage } from "./messaging";
import { createClient } from "@supabase/supabase-js";

interface AppState {
  code: string;
  selectedFramework: Framework;
  isLoading: boolean;
  htmlPreview: HTMLPreview;
  settings: PluginSettings | null;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  warnings: Warning[];
}

const emptyPreview = { size: { width: 0, height: 0 }, content: "" };

const SUPABASE_URL = 'https://vwqhreycgyfxhtwyohdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWhyZXljZ3lmeGh0d3lvaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3ODI4NzIsImV4cCI6MjA1MjM1ODg3Mn0.FcVl0C5e-vDyGW3dmrAcPOmiqZT3OhTa9spyNvv6WZY';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: false,
    htmlPreview: emptyPreview,
    settings: null,
    colors: [],
    gradients: [],
    warnings: [],
  });

  const rootStyles = getComputedStyle(document.documentElement);
  const figmaColorBgValue = rootStyles
    .getPropertyValue("--figma-color-bg")
    .trim();

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const untypedMessage = event.data.pluginMessage as Message;
      console.log("[ui] message received:", untypedMessage);

      switch (untypedMessage.type) {
        case "code":
          const conversionMessage = untypedMessage as ConversionMessage;
          setState((prevState) => ({
            ...prevState,
            ...conversionMessage,
            selectedFramework: conversionMessage.settings.framework,
          }));
          break;

        case "pluginSettingChanged":
          const settingsMessage = untypedMessage as SettingsChangedMessage;
          setState((prevState) => ({
            ...prevState,
            settings: settingsMessage.settings,
            selectedFramework: settingsMessage.settings.framework,
          }));
          break;

        case "empty":
          // const emptyMessage = untypedMessage as EmptyMessage;
          setState((prevState) => ({
            ...prevState,
            code: "",
            htmlPreview: emptyPreview,
            warnings: [],
            colors: [],
            gradients: [],
          }));
          break;

        case "error":
          const errorMessage = untypedMessage as ErrorMessage;

          setState((prevState) => ({
            ...prevState,
            colors: [],
            gradients: [],
            code: `Error :(\n// ${errorMessage.error}`,
          }));
          break;
        default:
          break;
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  useEffect(() => {
    if (state.selectedFramework === null) {
      const timer = setTimeout(
        () => setState((prevState) => ({ ...prevState, isLoading: true })),
        300,
      );
      return () => clearTimeout(timer);
    } else {
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, [state.selectedFramework]);

  if (state.selectedFramework === null) {
    return state.isLoading ? (
      <div className="w-full h-96 justify-center text-center items-center dark:text-white text-lg">
        Loading Plugin...
      </div>
    ) : null;
  }

  const handleFrameworkChange = (updatedFramework: Framework) => {
    setState((prevState) => ({
      ...prevState,
      // code: "// Loading...",
      selectedFramework: updatedFramework,
    }));
    postUISettingsChangingMessage("framework", updatedFramework, {
      targetOrigin: "*",
    });
  };
  console.log("state.code", state.code.slice(0, 25));

  const handleOpenWithPolymet = async (code: string) => {
    try {
      // Insert code into the `code_gen` table and retrieve the inserted row's ID
      const { data, error } = await supabase
        .from("code_gen")
        .insert([{ code }])
        .select("id") // Select the `id` field of the inserted row
        .single();

      if (error) {
        console.error("Error inserting code:", error);
        return;
      }

      if (data && data.id) {
        // Redirect to the Next.js app at `localhost:3003/editor/{id}`
        const id = data.id;
        const url = `http://localhost:3003/editor/${id}`;

        console.log("Redirecting to:", url);

        // Open the URL in the user's default browser
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };




  return (
    <div className={`${figmaColorBgValue === "#ffffff" ? "" : "dark"}`}>
      <PluginUI
        code={state.code}
        warnings={state.warnings}
        selectedFramework={state.selectedFramework}
        setSelectedFramework={handleFrameworkChange}
        htmlPreview={state.htmlPreview}
        settings={state.settings}
        onPreferenceChanged={(key: string, value: boolean | string) =>
          postUISettingsChangingMessage(key, value, { targetOrigin: "*" })
        }
        colors={state.colors}
        gradients={state.gradients}
        handleOpenWithPolymet={handleOpenWithPolymet}
      />
    </div>
  );
}
