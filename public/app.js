const elements = {
  recordButton: document.querySelector("#recordButton"),
  recordLabel: document.querySelector("#recordLabel"),
  statusText: document.querySelector("#statusText") || document.querySelector(".tap-hint"),
  resultPanel: document.querySelector("#resultPanel"),
  infoCard: document.querySelector("#infoCard"),
  scoreValue: document.querySelector("#scoreValue"),
  resultLabel: document.querySelector("#resultLabel"),
  resultTagline: document.querySelector("#resultTagline"),
  resultSummary: document.querySelector("#resultSummary"),
  frequencyValue: document.querySelector("#frequencyValue"),
  decayValue: document.querySelector("#decayValue"),
  highValue: document.querySelector("#highValue"),
  reasonList: document.querySelector("#reasonList"),
  aiBadge: document.querySelector("#aiBadge"),
  aiNotice: document.querySelector("#aiNotice"),
  waveCanvas: document.querySelector("#waveCanvas"),
  tapHint: document.querySelector(".tap-hint"),
  melonImage: document.querySelector("#melonImage"),
  meterBars: document.querySelectorAll(".meter-bars span"),
};

let audioContext;
let sourceNode;
let processorNode;
let silentGain;
let stream;
let chunks = [];
let startedAt = 0;
let timerId = 0;
let maxRecordTimer = 0;
let isRecording = false;
let lastPreviewSamples = null;

if (!navigator.mediaDevices?.getUserMedia) {
  elements.recordButton.disabled = true;
  elements.tapHint.textContent = "当前浏览器不支持麦克风录音";
}

elements.recordButton.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    audioContext = new AudioContext();
    await audioContext.resume();
    sourceNode = audioContext.createMediaStreamSource(stream);
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    chunks = [];
    startedAt = performance.now();
    isRecording = true;

    processorNode.onaudioprocess = (event) => {
      if (!isRecording) return;
      const channel = event.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(channel));
      drawWave(channel, "#ff7a8a");
    };

    sourceNode.connect(processorNode);
    processorNode.connect(silentGain);
    silentGain.connect(audioContext.destination);

    setMode("recording");
    elements.recordLabel.textContent = "完成检测";
    elements.tapHint.innerHTML = `
      <span class="hint-line hint-line-left"></span>
      正在听，敲完点完成
      <span class="hint-line hint-line-right"></span>
    `;
    elements.resultPanel.hidden = true;
    startTimer();
    maxRecordTimer = window.setTimeout(stopRecording, 6500);
  } catch (error) {
    showError(error.message.includes("Permission") ? "麦克风权限未打开" : error.message);
  }
}

async function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  window.clearTimeout(maxRecordTimer);
  stopTimer();

  const sampleRate = audioContext.sampleRate;
  const samples = mergeChunks(chunks);
  lastPreviewSamples = samples;

  cleanupAudio();
  elements.recordLabel.textContent = "开始检测";

  if (samples.length < sampleRate * 0.18) {
    setMode("idle");
    showError("录音太短，再敲 2 到 3 下");
    return;
  }

  const wavBuffer = encodeWav(samples, sampleRate);
  await analyzeWavBlob(new Blob([wavBuffer], { type: "audio/wav" }), "正在分析敲瓜声");
}

async function analyzeWavBlob(blob, message) {
  setMode("analyzing");
  elements.tapHint.innerHTML = `
    <span class="hint-line hint-line-left"></span>
    ${message}
    <span class="hint-line hint-line-right"></span>
  `;
  elements.recordButton.disabled = true;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "audio/wav" },
      body: blob,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "分析失败");
    renderResult(data);
    setMode("idle");
    elements.tapHint.innerHTML = `
      <span class="hint-line hint-line-left"></span>
      可以再测一次
      <span class="hint-line hint-line-right"></span>
    `;
  } catch (error) {
    setMode("idle");
    showError(error.message || "分析失败，请重试");
  } finally {
    elements.recordButton.disabled = false;
  }
}

function renderResult(data) {
  const score = Number(data.score || 0);

  // 更新底部信息卡分数
  elements.scoreValue.textContent = score;
  elements.meterBars.forEach((bar, index) => {
    const threshold = (index + 1) * 34;
    bar.classList.toggle("active", score >= threshold);
  });

  // 更新结果面板
  elements.resultPanel.hidden = false;
  elements.resultLabel.textContent = data.label || "声学评分";
  elements.resultTagline.textContent = data.tagline || "请结合外观复核";
  elements.resultSummary.textContent = data.summary || "敲击声只能作为辅助判断。";
  elements.frequencyValue.textContent = `${Math.round(data.features?.dominantFrequency || 0)} Hz`;
  elements.decayValue.textContent = `${Number(data.features?.decaySeconds || 0).toFixed(2)} s`;
  elements.highValue.textContent = `${Math.round((data.features?.highBandEnergy || 0) * 100)}%`;
  elements.aiBadge.textContent = data.aiUsed ? "AI 辅助" : "本地评分";
  elements.aiNotice.textContent = data.aiUsed
    ? "已接入 AI 复核声学特征"
    : "未配置 AI Key，已使用本地标准评分";

  elements.reasonList.replaceChildren(
    ...(data.reasons || []).map((reason) => {
      const item = document.createElement("li");
      item.textContent = reason;
      return item;
    }),
  );

  // 滚动到结果面板
  setTimeout(() => {
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

function showError(message) {
  elements.tapHint.innerHTML = `
    <span class="hint-line hint-line-left"></span>
    ${message}
    <span class="hint-line hint-line-right"></span>
  `;
  elements.aiNotice.textContent = "";
}

function setMode(mode) {
  document.body.dataset.mode = mode;
}

function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    const elapsed = Math.floor((performance.now() - startedAt) / 1000);
    elements.recordLabel.textContent = `完成检测 (${elapsed}s)`;
  }, 500);
}

function stopTimer() {
  window.clearInterval(timerId);
}

function cleanupAudio() {
  processorNode?.disconnect();
  sourceNode?.disconnect();
  silentGain?.disconnect();
  stream?.getTracks().forEach((track) => track.stop());
  audioContext?.close();
  processorNode = null;
  sourceNode = null;
  silentGain = null;
  stream = null;
  audioContext = null;
}

function mergeChunks(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return merged;
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (const sample of samples) {
    const value = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, value < 0 ? value * 32768 : value * 32767, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view, offset, value) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function drawWave(samples, color) {
  const canvas = elements.waveCanvas;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const stride = Math.max(1, Math.floor(samples.length / width));

  context.clearRect(0, 0, width, height);
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.strokeStyle = color;
  context.beginPath();

  for (let x = 0; x < width; x += 1) {
    let peak = 0;
    for (let i = 0; i < stride; i += 1) {
      peak = Math.max(peak, Math.abs(samples[x * stride + i] || 0));
    }
    const y = height / 2 - peak * height * 0.42;
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }

  for (let x = width - 1; x >= 0; x -= 1) {
    let peak = 0;
    for (let i = 0; i < stride; i += 1) {
      peak = Math.max(peak, Math.abs(samples[x * stride + i] || 0));
    }
    const y = height / 2 + peak * height * 0.42;
    context.lineTo(x, y);
  }

  context.closePath();
  context.globalAlpha = 0.22;
  context.fillStyle = color;
  context.fill();
  context.globalAlpha = 1;
  context.stroke();
}
