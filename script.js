const URL = "https://aryanshu7.github.io/smartcart-ai/model/";

let model, webcam, maxPredictions;
let products = {};
let lastProduct = "";

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

    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    container.appendChild(webcam.canvas);

    webcam.canvas.style.border = "3px solid black";

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

    if (highest > 0.85 && productName !== lastProduct) {
        lastProduct = productName;
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

        speak(name + " costs " + p.price);
    }
}

function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(speech);
}
