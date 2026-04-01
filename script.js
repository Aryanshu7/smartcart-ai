const URL = "https://aryanshu7.github.io/smartcart-ai/model/";

let model, webcam, maxPredictions;
let products = {};
let lastProduct = "";

// Load products data
async function loadProducts() {
    const response = await fetch("products.json");
    products = await response.json();
}

// Start camera and load model
async function init() {
    alert("Loading model...");

    await loadProducts();

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Model loading failed:", error);
        alert("Model failed to load");
        return;
    }

    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

// Loop camera frames
async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// Predict product
async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let highest = 0;
    let productName = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highest) {
            highest = prediction[i].probability;
            productName = prediction[i].className;
        }
    }

    if (highest > 0.85 && productName !== lastProduct) {
        lastProduct = productName;
        showProduct(productName);
    }
}

// Show product info
function showProduct(name) {
    if (products[name]) {
        const p = products[name];

        document.getElementById("product-info").innerHTML =
            "<h3>" + name + "</h3>" +
            "<p><b>Price:</b> " + p.price + "</p>" +
            "<p><b>Calories:</b> " + p.calories + "</p>" +
            "<p><b>Alternative:</b> " + p.alternative + "</p>" +
            "<p><b>Offer:</b> " + p.offer + "</p>";

        speak(name + " costs " + p.price + ". Offer " + p.offer);
    }
}

// Voice assistant
function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    speechSynthesis.speak(speech);
}
