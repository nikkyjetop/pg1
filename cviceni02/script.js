// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
    var files = item.files;

    if (files.length === 0) return;

    var file = files[0]; // Prvý nahraný súbor

    // Skontrolujeme, či je súbor obrázok
    if (!file.type.match('image.*')) {
        alert("Prosím nahrajte obrázok.");
        return;
    }

    var reader = new FileReader();

    reader.onload = function(evt) {
        var srcImg = new Image();
        srcImg.src = evt.target.result;

        srcImg.onload = function() {
            var srcCanvas = document.getElementById(elementName);
            var srcContext = srcCanvas.getContext("2d");

            // Nastavenie veľkosti canvasu na veľkosť obrázka
            srcCanvas.height = srcImg.height;
            srcCanvas.width = srcImg.width;

            srcContext.drawImage(srcImg, 0, 0);

            // Povolenie tlačidla Convert po načítaní všetkých troch obrázkov
            checkIfReadyToConvert();
        }
    };

    reader.readAsDataURL(file);
}

function checkIfReadyToConvert() {
    var personCanvas = document.getElementById("person").getContext("2d").canvas;
    var backgroundCanvas = document.getElementById("background").getContext("2d").canvas;
    var logoCanvas = document.getElementById("logo").getContext("2d").canvas;

    // Skontrolujeme, či sú všetky canvasy naplnené obrázkami
    if (personCanvas.width > 0 && backgroundCanvas.width > 0 && logoCanvas.width > 0) {
        document.getElementById("convert").disabled = false;
    }
}

// Callback function called, when clicked at Convert button
function convertImage() {
    var personCanvas = document.getElementById("person");
    var personContext = personCanvas.getContext("2d");
    var canvasHeight = personCanvas.height;
    var canvasWidth = personCanvas.width;

    var personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    var backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var resultCanvas = document.getElementById("result");
    var resultContext = resultCanvas.getContext("2d");

    // Nastavíme veľkosť result canvasu na veľkosť vstupných obrázkov
    resultCanvas.height = canvasHeight;
    resultCanvas.width = canvasWidth;

    // Klíčovanie: odstránenie zeleného pozadia z postavy
    var resultImageData = resultContext.createImageData(canvasWidth, canvasHeight);
    var personData = personImageData.data;
    var backgroundData = backgroundImageData.data;
    var logoData = logoImageData.data;
    var resultData = resultImageData.data;

    for (var i = 0; i < personData.length; i += 4) {
        var r = personData[i];
        var g = personData[i + 1];
        var b = personData[i + 2];
        var a = personData[i + 3];

        // Podmienka pre zelené klíčovanie (ak je zelená farba dominantná, odstránime ju)
        if (g > 100 && g > r && g > b) {
            // Na miesto zelenej vložíme pozadie
            resultData[i] = backgroundData[i];
            resultData[i + 1] = backgroundData[i + 1];
            resultData[i + 2] = backgroundData[i + 2];
            resultData[i + 3] = backgroundData[i + 3];
        } else {
            // Inak vložíme popredie (postavu)
            resultData[i] = r;
            resultData[i + 1] = g;
            resultData[i + 2] = b;
            resultData[i + 3] = a;
        }
    }
    // Prevedenie loga do odtieňov sivej
    for (var j = 0; j < logoData.length; j += 4) {
        if(logoData[j + 3] != 0) {
            var avg = (logoData[j] + logoData[j + 1] + logoData[j + 2]) / 3;
            resultData[j] = avg;    // Red
            resultData[j + 1] = avg; // Green
            resultData[j + 2] = avg; // Blue
        }
    }

    // Vykreslenie finálneho obrázku
    resultContext.putImageData(resultImageData, 0, 0);
}

// Pridáme event listener na tlačidlo
document.getElementById("convert").addEventListener('click', convertImage);
