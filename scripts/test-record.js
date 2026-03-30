const { spawn } = require('child_process');
const path = require('path');

// --- YOUR SPECIFIC CONFIG ---
const DROIDCAM_IP = "10.169.7.47"; // Change this if the other IP is the phone
const PORT = "4747";
const STREAM_URL = `http://${DROIDCAM_IP}:${PORT}/mjpegfeed`;
const OUTPUT_FILE = path.join(__dirname, `bodycam_evidence_${Date.now()}.mp4`);

console.log(`🚀 Connecting to Bodycam at ${STREAM_URL}...`);

// FFmpeg command to grab the MJPEG stream and save as H264 MP4
const ffmpeg = spawn('ffmpeg', [
  '-i', STREAM_URL,
  '-t', '20',             // Record for 20 seconds for this test
  '-c:v', 'libx264',      // Convert to H.264
  '-pix_fmt', 'yuv420p',  // Ensure it plays in Chrome/Dashboard
  '-y',                   // Overwrite if exists
  OUTPUT_FILE
]);

ffmpeg.stderr.on('data', (data) => {
  // Shows recording progress in your terminal
  console.log(`Recording Progress: ${data.toString().split('\n')[0]}`);
});

ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ SUCCESS! Document saved to: ${OUTPUT_FILE}`);
  } else {
    console.error(`\n❌ ERROR: FFmpeg failed. Is DroidCam running at ${DROIDCAM_IP}?`);
  }
});