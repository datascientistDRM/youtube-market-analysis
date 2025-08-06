// frontend/src/components/ChatBox.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PHASES = {
  Idle: "idle",
  Generating: "generating",
  FetchingChannels: "fetchingChannels",
  FetchingVideoData: "fetchingVideoData",
  Done: "done",
} as const;
type Phase = typeof PHASES[keyof typeof PHASES];

interface Channel {
  id: string;
  name: string;
  subscriberCount: number;
}
interface VideoMetrics extends Channel {
  viewCount: number;
  videoCount: number;
}

// A small helper to time out a fetch if it takes too long
async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeout = 15000
): Promise<Response> {
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

const ChatBox: React.FC = () => {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>(PHASES.Idle);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VideoMetrics[]>([]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    setMetrics([]);

    // 1) GENERATE QUERIES
    setPhase(PHASES.Generating);
    console.log("⏳ Phase: Generating queries");
    let queries: string[] = [];
    try {
      const res = await fetchWithTimeout(
        "/api/generate-queries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        },
        10000
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const body = await res.json();
      queries = body.queries || [];
      console.log("✅ Queries:", queries);
    } catch (err: any) {
      console.error("❌ generate-queries failed", err);
      setError(
        err.name === "AbortError"
          ? "LLM request timed out"
          : "Error generating queries: " + err.message
      );
      setPhase(PHASES.Idle);
      return;
    }

    // 2) FETCH CHANNELS
    setPhase(PHASES.FetchingChannels);
    console.log("⏳ Phase: Fetching channels");
    let channels: Channel[] = [];
    try {
      const res = await fetchWithTimeout(
        "/api/get-channels",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queries }),
        },
        15000
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const body = await res.json();
      channels = body.channels || [];
      console.log("✅ Channels:", channels);
    } catch (err: any) {
      console.error("❌ get-channels failed", err);
      setError(
        err.name === "AbortError"
          ? "Channel fetch timed out"
          : "Error fetching channels: " + err.message
      );
      setPhase(PHASES.Idle);
      return;
    }

    // 3) FETCH VIDEO DATA
    setPhase(PHASES.FetchingVideoData);
    console.log("⏳ Phase: Fetching video data");
    try {
      const res = await fetchWithTimeout(
        "/api/get-video-data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channels }),
        },
        30000
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const body = await res.json();
      setMetrics(body.channels || []);
      console.log("✅ Video metrics:", body.channels);
    } catch (err: any) {
      console.error("❌ get-video-data failed", err);
      setError(
        err.name === "AbortError"
          ? "Video data fetch timed out"
          : "Error fetching video data: " + err.message
      );
      setPhase(PHASES.Idle);
      return;
    }

    // 4) DONE
    setPhase(PHASES.Done);
    console.log("🎉 Phase: Done");
  };

  // render
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <form onSubmit={onSubmit} className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for market analysis…"
          disabled={phase !== PHASES.Idle}
          className="
            flex-1 border border-drm-teal
            rounded-l-xl px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-drm-teal
            transition
          "
        />
        <button
          type="submit"
          disabled={phase !== PHASES.Idle}
          className="
            px-6 py-2 rounded-r-xl
            bg-drm-navy text-white font-semibold
            hover:scale-105 transform transition-all
            disabled:opacity-50 cursor-not-allowed
          "
        >
          {phase === PHASES.Idle ? "Send" : "Loading…"}
        </button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 text-center"
        >
          {error}
        </motion.div>
      )}

      {(phase === PHASES.Generating ||
        phase === PHASES.FetchingChannels ||
        phase === PHASES.FetchingVideoData) && (
        <div className="text-center py-4 text-gray-600">
          {phase === PHASES.Generating && "🔄 Generating Queries…"}
          {phase === PHASES.FetchingChannels && "🔄 Fetching Channels…"}
          {phase === PHASES.FetchingVideoData && "🔄 Fetching Video Data…"}
        </div>
      )}

      {phase === PHASES.Done && metrics.length > 0 && (
        <div className="space-y-8">
          {/* Total Views Bar Chart */}
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="viewCount" name="Views" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Videos Bar Chart */}
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="videoCount" name="Videos" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
