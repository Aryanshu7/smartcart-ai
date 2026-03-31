const URL = "./model/";

window.tmImage = tmImage;

let model, webcam, maxPredictions;
let products = {};

async function loadProducts() {
    const response = await fetch("products.json");
    products = await response.json();
}

async function init() {
    alert("Loading model...");

    await loadProducts();

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

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

    if (highest > 0.8) {
        showProduct(productName);
    }
}

function showProduct(name) {
    if (products[name]) {
        const p = products[name];
        document.getElementById("product-info").innerHTML =
            "<h3>" + name + "</h3>" +
            "<p>Price: " + p.price + "</p>" +
            "<p>Calories: " + p.calories + "</p>" +
            "<p>Alternative: " + p.alternative + "</p>" +
            "<p>Offer: " + p.offer + "</p>";

        speak(name + " costs " + p.price + ". Offer " + p.offer);
    }
}

function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(speech);
}
