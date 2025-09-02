/**
 * Simple mock orchestrator server for chat testing.
 * Accepts POST requests and streams mock responses via SSE.
 *
 * Usage: node mock-orchestrator.js
 */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = 4000;

// Allow CORS for local frontend
app.use(cors());
app.use(bodyParser.json());

/** Mock responses data (copy from your frontend) */
const mockResponsesData = [
  {
    content:
      "I have received the request to create an AI-generated music video based on a thrash metal ballad in the style of Metallica. I will split the task into several steps: generating the song, generating the script, creating images, generating videos, and finally compiling everything into a single MP4 file.",
    type: "reasoning",
    timedelta: 789,
  },
  {
    content:
      "I have checked the subscription plan for the Song Generator (did:nv:0c63e2e0449afd88...). There's insufficient balance, so I need to purchase credits. The agent accepts payments in VIRTUAL; I must perform a swap to acquire 1 VIRTUAL.",
    type: "reasoning",
    timedelta: 1721,
  },
  {
    content: "Swap completed to obtain 1 VIRTUAL.",
    type: "transaction",
    txHash:
      "0x1d465ab71cd0c77252f4aade9ea12d7b9f06e62d154a89e863c1ba0ef28257ef",
    timedelta: 5202,
  },
  {
    content:
      "Credits purchased for 1 VIRTUAL under the Song Generator plan. The credit balance has been updated successfully.",
    type: "reasoning",
    timedelta: 1240,
  },
  {
    content:
      "I'm generating the task for the Song Generator. Minimum credits required: 1. This task may take a while to complete.",
    type: "reasoning",
    timedelta: 840,
  },
  {
    content:
      "Here is the generated song 'Shattered reflections of Silence': https://cdn.ttapi.io/suno/2025-03-28/307287f8-70df-4032-96c3-277e8d5e2be5.mp3",
    type: "answer",
    timedelta: 12311,
  },
  {
    content:
      "Now I will create the music video script. Checking the subscription plan for the Script Generator (did:nv:f6a20637d1bca9ea...). I have found insufficient balance. The agent requires payment in LARRY; I need to swap 0.1 USDC for 100 LARRY.",
    type: "reasoning",
    timedelta: 1536,
  },
  {
    content: "Swap completed to obtain 100 LARRY.",
    type: "transaction",
    txHash:
      "0xf9c7409e15a08cbaa58b9f9b360ec0f020cd33a9c7a9ceefee3ef3a5a257a564",
    timedelta: 4150,
  },
  {
    content:
      "Credits purchased for 100 LARRY under the Script Generator plan. The credit balance has been updated successfully.",
    type: "reasoning",
    timedelta: 2248,
  },
  {
    content:
      "I'm generating the task for the Script Generator. Minimum credits required: 1. This task may take a while to complete.",
    type: "reasoning",
    timedelta: 848,
  },
  {
    content:
      "Script and prompts have been successfully generated for 'Shattered reflections of Silence'. Scenes, camera movements, characters, and locations are defined.",
    type: "answer",
    timedelta: 8207,
  },
  {
    content:
      "Next, I'm moving on to image generation for 8 characters and 5 settings. Checking the subscription plan for the Image/Video Generator (did:nv:61d2abd74124ba6b83b4ce48d1a13d6ce8990cbe3a0c72fed3ff132d0eefabc4...). The balance is insufficient, so I'll purchase credits with 1 USDC.",
    type: "reasoning",
    timedelta: 2912,
  },
  {
    content:
      "Credits purchased with 1 USDC for the Image/Video Generator plan.",
    type: "transaction",
    txHash:
      "0x08c253511b149f1238f7473764ab354af6a49912fe3254d3b885e5b257debed1",
    timedelta: 4985,
  },
  {
    content:
      "I'm generating the image generation task for the Image/Video Generator. Minimum credits required: 1 per image. This task may take a while to complete.",
    type: "reasoning",
    timedelta: 912,
  },
  {
    content:
      "Images for the 6 characters and 7 settings were successfully generated. Here are the final URLs:\n\nCharacters:\n1) https://v3.fal.media/files/panda/X5YwwVFpLLN6Wy_qOZkaU.png\n2) https://v3.fal.media/files/penguin/a9D_YfNE-8bAlhBRX2tKh.png:\n3) https://v3.fal.media/files/kangaroo/bt88ZAR8UG2PaVBYsfeTx.png:\n4) https://v3.fal.media/files/lion/UE_yDtzCM0Bz5newE7Z8I.png:\n5) https://v3.fal.media/files/elephant/d9sTGms8F9Gs-mP0O9-fz.png:\n6) https://v3.fal.media/files/koala/evE-ga_iGdPgxGNSRyw2h.png\n\nSettings:\n1) https://v3.fal.media/files/koala/1izDMDtZQuh4q40y3u3Qd.png\n2) https://v3.fal.media/files/panda/jfHCT6ct22w7vF63hfI0v.png\n3) https://v3.fal.media/files/elephant/GMNVt7BfCTUauKYlo9DL2.png\n4) https://v3.fal.media/files/panda/E7SjRcrp4SFacsNX4DPm9.png\n5) https://v3.fal.media/files/monkey/iressIGoOBXrba-WPCuvk.png\n6) https://v3.fal.media/files/panda/BOiaDpcMu3BHhwDuSt_8C.png\n7) https://v3.fal.media/files/zebra/0wbhYio9YY_FqS6gSSWek.png",
    type: "answer",
    timedelta: 9212,
  },
  {
    content:
      "I am now creating 18 video generation tasks based on the script prompts, each executed concurrently using the same subscription plan. Minimum credits required: 5 per video. This task may take a while to complete.",
    type: "reasoning",
    timedelta: 1054,
  },
  {
    content:
      "All 18 video clips have been generated successfully. The final set is complete and ready for merging with the audio track.",
    type: "answer",
    timedelta: 39124,
  },
  {
    content:
      "I am merging the video tracks without audio first, then I'll add the generated song. Once the final encoding is done, I will upload the MP4 file to S3.",
    type: "reasoning",
    timedelta: 1875,
  },
  {
    content:
      "The final video 'Shattered reflections of Silence' has been uploaded to S3: https://nvm-music-video-swarm-bck.s3.eu-central-1.amazonaws.com/shattered_reflections_of_silence.mp4",
    type: "answer",
    timedelta: 6342,
  },
];

/** In-memory store for tasks */
const tasks = {};

/**
 * POST /tasks/send
 * Receives a chat message and returns a new taskId.
 */
app.post("/tasks/send", (req, res) => {
  // Generate a UUID v4 for taskId
  const taskId = crypto.randomUUID();
  // Store the task (could store more info if needed)
  tasks[taskId] = { created: Date.now(), status: "pending" };
  res.json({ taskId });
});

/**
 * GET /tasks/events/:taskId
 * Streams mock responses as SSE, respecting the timedelta.
 */
app.get("/tasks/events/:taskId", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  let i = 0;
  let closed = false;

  // Helper to send the next message
  function sendNext() {
    if (closed || i >= mockResponsesData.length) {
      res.end();
      return;
    }
    const msg = mockResponsesData[i];
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
    i++;
    if (i < mockResponsesData.length) {
      setTimeout(sendNext, mockResponsesData[i].timedelta);
    } else {
      // End after last message
      setTimeout(() => res.end(), 1000);
    }
  }

  // Start with the first message after its timedelta
  setTimeout(sendNext, mockResponsesData[0].timedelta);

  // Handle client disconnect
  req.on("close", () => {
    closed = true;
  });
});

app.listen(PORT, () => {
  console.log(`Mock orchestrator running on http://localhost:${PORT}`);
});
