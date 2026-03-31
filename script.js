const URL = "model/";

let model, webcam, maxPredictions;
let productsData = {};

async function loadProducts() {
    const response = await fetch("products.json");
    productsData = await response.json();
}

async function init() {
    await loadProducts();

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 300, flip);
    await webcam.setup();
    await webcam.play();

    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let highest = prediction[0];

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highest.probability) {
            highest = prediction[i];
        }
    }

    if (highest.probability > 0.8) {
        showProductInfo(highest.className);
    }
}

function showProductInfo(product) {
    let info = productsData[product];

    if (info) {
        document.getElementById("productName").innerText = "Product: " + product;
        document.getElementById("price").innerText = "Price: " + info.price;
        document.getElementById("calories").innerText = "Calories: " + info.calories;
        document.getElementById("alternative").innerText = "Alternative: " + info.alternative;
        document.getElementById("offer").innerText = "Offer: " + info.offer;

        speak(product + " costs " + info.price + ". Alternative is " + info.alternative);
    }
}

function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
}