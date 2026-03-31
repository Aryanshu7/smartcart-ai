const URL = "./model/";

let model, webcam, maxPredictions;

async function init() {
    alert("Start button clicked");

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    alert("Loading model...");

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    alert("Model loaded");

    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    window.requestAnimationFrame(loop);
}
