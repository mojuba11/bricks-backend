const { spawn } = require('child_process');
const path = require('path');

// --- CONFIGURATION ---
// 1. Double-check this IP matches the "WiFi IP" on your DroidCam phone app
const DROIDCAM_IP = "192.168.1.164"; 
const PORT = "8080";

// 2. Use /mjpegfeed for direct streaming (better for FFmpeg than /video)
const STREAM_URL = `http://${DROIDCAM_IP}:${PORT}/mjpegfeed`;
const OUTPUT_FILE = path.join(__dirname, `bodycam_evidence_${Date.now()}.mp4`);

console.log(`🚀 Attempting to connect to Bodycam at ${STREAM_URL}...`);
console.log(`⚠️  Make sure all browser tabs to this IP are CLOSED.`);

// FFmpeg command optimized for VM performance and quick connection
const ffmpeg = spawn('ffmpeg', [
  '-hide_banner',            // Clean up terminal output
  '-loglevel', 'error',      // Only show serious errors
  '-connect_timeout', '5000',// Stop trying after 5 seconds if "Busy"
  '-probesize', '32',        // Analyze less data to start recording instantly
  '-i', STREAM_URL,          // The Input Stream
  '-t', '20',                // Record for 20 seconds
  '-c:v', 'libx264',         // Encode to H.264
  '-preset', 'ultrafast',    // Use minimum CPU (Crucial for VMs)
  '-pix_fmt', 'yuv420p',     // Compatibility for all players
  '-y',                      // Overwrite existing file
  OUTPUT_FILE
]);

// Log recording progress/errors
ffmpeg.stderr.on('data', (data) => {
  console.log(`[FFmpeg Info]: ${data.toString().trim()}`);
});

ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ SUCCESS! Evidence saved to: ${OUTPUT_FILE}`);
  } else {
    console.error(`\n❌ ERROR: FFmpeg exited with code ${code}.`);
    console.error(`Possible reasons:`);
    console.error(`1. DroidCam is open in a browser tab (Close it!)`);
    console.error(`2. Phone and VM are on different networks.`);
    console.error(`3. The IP address ${DROIDCAM_IP} has changed.`);
  }
});

// Handle script interruption (Ctrl+C) gracefully
process.on('SIGINT', () => {
  ffmpeg.kill('SIGINT');
  console.log('\nStopping recording...');
  process.exit();
});