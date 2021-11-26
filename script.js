var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var img = new Image();
img.src = "";
var copieImg;
var grosimeSelectie = 3;
var selectieX;
var selectieY;
var selectieW;
var selectieH;

//incarcare imagine in browser
document.getElementById("fileBrowser").addEventListener("change", function (e) {
    let reader = new FileReader();
    reader.addEventListener('load', function (event) {
        img = new Image();
        img.src = event.target.result;
        //creare copie imagine
        copieImg = new Image();
        copieImg.src = img.src;
        img.width = 500;
        img.height = 500;
        //redimensionare canvas pastrand proportiile imaginii
        canvas.width = img.width;
        canvas.height = img.height;
        // while (canvas.width > 750 || canvas.height > 600) {
        //     canvas.width = canvas.width * 0.9;
        //     canvas.height = canvas.height * 0.9;
        // }
        //determinare si afisare pozitii maxime pentru introducerea textului
        document.getElementById("pozitiiMaxime").innerText = `(x maxim: ${canvas.height}; y maxim: ${canvas.width})`;
        document.getElementById("xText").max = canvas.width;
        document.getElementById("yText").max = canvas.height;
        //determinare si afisare dimensiuni imagine incarcata
        document.getElementById("dimensiuniActuale").innerText = `Dimensiunile imaginii sunt: ${img.width} x ${img.height}`;
        //selectareTotala();
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log('Am desenat imaginea pe canvas!');
        //resetare selectie
        selectieX = 0;
        selectieY = 0;
        selectieW = canvas.width;
        selectieH = canvas.height;
        //desenare selectie totala
        context.beginPath();
        context.strokeStyle = "magenta";
        context.lineWidth = 3;
        context.rect(selectieX, selectieY, selectieW, selectieH);
        context.stroke();


        //activare descarcare imagine
        document.getElementById("btnLinkDownload").hidden = false;
        //setare dimensiuni scalare
        document.getElementById("scalareLungime").value = img.height;
        document.getElementById("scalareLatime").value = img.width;

        //activare setari
        document.getElementById("histogramContainer").hidden = false;
        document.getElementById("selectionContainer").hidden = false;
        document.getElementById("efectContainer").hidden = false;
        document.getElementById("textContainer").hidden = false;
        document.getElementById("scaleContainer").hidden = false;

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        //selectie totala
        selectareTotala();
    });
    reader.readAsDataURL(e.target.files[0]);
});

//desenare selectare totala
function selectareTotala() {
    //stergere contur selectie
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    //resetare selectie
    selectieX = 0;
    selectieY = 0;
    selectieW = canvas.width;
    selectieH = canvas.height;
    // console.log("selectie totala", selectieX, selectieY, selectieW, selectieH);
    //desenare selectie totala
    context.beginPath();
    context.strokeStyle = "magenta";
    context.lineWidth = 3;
    context.rect(selectieX, selectieY, selectieW, selectieH);
    context.stroke();

    //histograma
    desenareHistograma();
}

//restaurare imaine initiala
function restaurareImagine() {
    img.src = copieImg.src;
    selectareTotala();
}

function stergereSelectie() {
    //modificare pixeli din interiorul selectiei in culoarea alb
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    selectiePixeli = context.getImageData(selectieX, selectieY, selectieW, selectieH);
    for (i = 0; i < (selectieW) * (selectieH) * 4; i += 4) {
        selectiePixeli.data[i + 0] = 256;
        selectiePixeli.data[i + 1] = 256;
        selectiePixeli.data[i + 2] = 256;
    }
    context.putImageData(selectiePixeli, selectieX, selectieY);
    //salvare modificari canvas in imagine
    img.src = canvas.toDataURL();

    selectareTotala();
}

//desenare selectie la click
var canvasOffset = canvas.getBoundingClientRect();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
//flag mousedown
var isDown = false;
//pozitii start selectie
var startX;
var startY;

//incepere desenare selectie
function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    //obtinere pozitie de start a selectiei
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    isDown = true;
}

//oprire desenare selectie
function handleMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    isDown = false;
    var width = mouseX - startX;
    var height = mouseY - startY;

    //modificari pt selectie inversa (de jos in sus)
    if (mouseX < startX) {
        aux = mouseX;
        mouseX = startX;
        startX = aux;
        width = (startX - mouseX) * -1
    }
    if (mouseY < startY) {
        aux = mouseY;
        mouseY = startY;
        startY = aux;
        height = (startY - mouseY) * -1;
    }

    if (selectieX >= 0 && selectieX <= canvas.width &&
        selectieY >= 0 && selectieY <= canvas.height &&
        selectieW >= 0 && selectieW <= canvas.width &&
        selectieH >= 0 && selectieH <= canvas.height) {
        //setare dimensiuni selectie
        selectieX = startX;
        selectieY = startY;
        selectieW = width;
        selectieH = height;

        //desenare histograma
        if (selectieW && selectieH) {
            desenareHistograma();
        }
    }
}

function handleMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDown) {
        return;
    }
    //obtinere pozitie curenta a capatului selectiei
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    context.strokeStyle = "magenta";
    context.lineWidth = grosimeSelectie;
    //stergere contur selectie anterioara
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    var width = mouseX - startX;
    var height = mouseY - startY;
    //desenare selectie
    context.strokeRect(startX, startY, width, height);
}

function monocolorSelectie() {
    //modificare pixeli din interiorul selectiei in monocolor
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    selectiePixeli = context.getImageData(selectieX, selectieY, selectieW, selectieH);
    for (i = 0; i < (selectieW) * (selectieH) * 4; i += 4) {
        avg = (selectiePixeli.data[i + 0] + selectiePixeli.data[i + 1] + selectiePixeli.data[i + 2]) / 3;
        selectiePixeli.data[i + 0] = avg;
        selectiePixeli.data[i + 1] = avg;
        selectiePixeli.data[i + 2] = avg;
    }
    context.putImageData(selectiePixeli, selectieX, selectieY);
    //salvare modificari canvas in imagine
    img.src = canvas.toDataURL();

    selectareTotala();
}

function invertedSelectie() {
    //modificare pixeli din interiorul selectiei in inversul lor
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    selectiePixeli = context.getImageData(selectieX, selectieY, selectieW, selectieH);
    for (i = 0; i < (selectieW) * (selectieH) * 4; i += 4) {
        selectiePixeli.data[i + 0] = 256 - selectiePixeli.data[i + 0];
        selectiePixeli.data[i + 1] = 256 - selectiePixeli.data[i + 1];
        selectiePixeli.data[i + 2] = 256 - selectiePixeli.data[i + 2];
    }
    context.putImageData(selectiePixeli, selectieX, selectieY);
    //salvare modificari canvas in imagine
    img.src = canvas.toDataURL();

    selectareTotala()
}

function sepiaSelectie() {
    //modificare pixeli din interiorul selectiei in sepia
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    selectiePixeli = context.getImageData(selectieX, selectieY, selectieW, selectieH);
    for (i = 0; i < (selectieW) * (selectieH) * 4; i += 4) {
        selectiePixeli.data[i + 0] = 0.393 * selectiePixeli.data[i + 0] + 0.769 * selectiePixeli.data[i + 1] + 0.189 * selectiePixeli.data[i + 2];
        selectiePixeli.data[i + 1] = 0.349 * selectiePixeli.data[i + 0] + 0.686 * selectiePixeli.data[i + 1] + 0.168 * selectiePixeli.data[i + 2];
        selectiePixeli.data[i + 2] = 0.272 * selectiePixeli.data[i + 0] + 0.534 * selectiePixeli.data[i + 1] + 0.131 * selectiePixeli.data[i + 2];
    }
    context.putImageData(selectiePixeli, selectieX, selectieY);
    //salvare modificari canvas in imagine
    img.src = canvas.toDataURL();

    selectareTotala()
}

function adaugareText() {
    if (document.getElementById("text").value.trim() === "") {
        alert("Introduceti textul dorit!");
        return;
    }
    //tratare valori in afara dimensiunilor canvasului
    if (document.getElementById("xText").value < 0 || document.getElementById("yText").value < 0 ||
        document.getElementById("xText").value > canvas.width || document.getElementById("yText").value > canvas.height) {
        alert(`Pozitiile sunt incorecte!`);
        return;
    }
    //desenare text
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    context.font = `${document.getElementById("dimensiuneText").value}px Arial`;
    context.fillStyle = document.getElementById("culoareText").value;
    context.textAlign = "center";
    context.fillText(document.getElementById("text").value.trim(), document.getElementById("xText").value.trim(), document.getElementById("yText").value.trim());

    //salvare imagine din canvas
    img.src = canvas.toDataURL();
    selectareTotala();
}

function calculareLatime() {
    if (document.getElementById("scalareLungime").value < 100 || document.getElementById("scalareLungime").value > 2000) {
        alert("Dimensiuni incorecte!");
        return;
    }
    lungimeNoua = document.getElementById("scalareLungime").value;
    lungimeVeche = img.height;

    modificareProcentuala = lungimeNoua / lungimeVeche;
    document.getElementById("scalareLatime").value = Math.floor(document.getElementById("scalareLatime").value * modificareProcentuala);
}

function calculareLungime() {
    if (document.getElementById("scalareLatime").value < 100 || document.getElementById("scalareLatime").value > 2000) {
        alert("Dimensiuni incorecte!");
        return;
    }
    latimeNoua = document.getElementById("scalareLatime").value;
    latimeVeche = img.width;

    modificareProcentuala = latimeNoua / latimeVeche;
    document.getElementById("scalareLungime").value = Math.floor(document.getElementById("scalareLungime").value * modificareProcentuala);
}

function scalareImagine() {
    canvas.height = document.getElementById("scalareLungime").value;
    canvas.width = document.getElementById("scalareLatime").value;
    img.width = canvas.width;
    img.height = canvas.height;
    document.getElementById("dimensiuniActuale").innerText = `Dimensiunile imaginii sunt: ${img.width} x ${img.height}`;
    selectareTotala();
}

function descarcaImagine() {
    //setare sursa imagine pentru descarcare
    document.getElementById("linkDownload").href = img.src;
}

function desenareHistograma() {
    //SETEAZA SELECTIA
    if (selectieW !== 0 && selectieH !== 0) {
        // console.log("selectie histograma", selectieX, selectieY, selectieW, selectieH);
        selectiePixeli = context.getImageData(selectieX, selectieY, selectieW, selectieH);
        nrPixeli = selectieW * selectieH;

        r = [];
        g = [];
        b = [];
        for (i = 0; i < 256; i++) {
            r[i] = 0;
            g[i] = 0;
            b[i] = 0;
        }

        for (i = 0; i < nrPixeli; i += 4) {
            r[selectiePixeli.data[i + 0]]++;
            g[selectiePixeli.data[i + 1]]++;
            b[selectiePixeli.data[i + 2]]++;
        }

        var canvasH = document.getElementById("histograma");
        var contextH = canvasH.getContext("2d");
        contextH.clearRect(0, 0, canvasH.width, canvasH.height)
        contextH.globalCompositeOperation = "exclusion";

        var maxr = Math.max(...r);
        var maxg = Math.max(...g);
        var maxb = Math.max(...b);

        var f = canvasH.height / Math.max(maxr, maxg, maxb);

        for (i = 0; i < 256; i++) {
            contextH.fillStyle = "#f00";
            contextH.fillRect(i, canvasH.height - f * r[i], 1, f * r[i]);
        }

        for (i = 0; i < 256; i++) {
            contextH.fillStyle = "#0f0";
            contextH.fillRect(i, canvasH.height - f * g[i], 1, f * g[i]);
        }

        for (i = 0; i < 256; i++) {
            contextH.fillStyle = "#00f";
            contextH.fillRect(i, canvasH.height - f * b[i], 1, f * b[i]);
        }
    }
}

//evenimente butoane
document.getElementById("btnSelectareTotala").addEventListener("click", selectareTotala);
document.getElementById("btnStergereSelectie").addEventListener("click", stergereSelectie);
document.getElementById("btnRestaurareImagine").addEventListener("click", restaurareImagine);
document.getElementById("btnMonocolor").addEventListener("click", monocolorSelectie);
document.getElementById("btnInverted").addEventListener("click", invertedSelectie);
document.getElementById("btnSepia").addEventListener("click", sepiaSelectie);
document.getElementById("btnAdaugareText").addEventListener("click", adaugareText);
document.getElementById("btnScalare").addEventListener("click", scalareImagine);
document.getElementById("btnLinkDownload").addEventListener("click", descarcaImagine);

//evenimente trasare selectie pe canvas
document.getElementById('canvas').addEventListener('mousedown', function (e) { handleMouseDown(e); });
document.getElementById('canvas').addEventListener('mousemove', function (e) { handleMouseMove(e); });
document.getElementById('canvas').addEventListener('mouseup', function (e) { handleMouseUp(e); });

// TODO: verifica daca s a modificat selectia sau daca exista selectie

// //evenimente drag and drop
// document.getElementById("canvas").addEventListener("dragover", (event) => event.preventDefault());
// document.getElementById("canvas").addEventListener("drop", (event) => {
//     event.preventDefault();
//     img = new Image();
//     document.getElementById("textDragAndDrop").innerText = "";

//     const droppedFile = event.dataTransfer.files[0];
//     const imgDropped = document.createElement("img");
//     imgDropped.src = URL.createObjectURL(droppedFile);
//     img.src = imgDropped.src;

//     copieImg = new Image();
//         copieImg.src = img.src;
//         //redimensionare canvas pastrand proportiile imaginii
//         canvas.width = img.width;
//         canvas.height = img.height;
//         while (canvas.width > 750 || canvas.height > 600) {
//             canvas.width = canvas.width * 0.9;
//             canvas.height = canvas.height * 0.9;
//         }
//         //determinare si afisare pozitii maxime pentru introducerea textului
//         document.getElementById("pozitiiMaxime").innerText = `(x maxim: ${canvas.height}; y maxim: ${canvas.width})`;
//         document.getElementById("xText").max = canvas.width;
//         document.getElementById("yText").max = canvas.height;
//         //determinare si afisare dimensiuni imagine incarcata
//         document.getElementById("dimensiuniActuale").innerText = `Dimensiunile imaginii sunt: ${img.width} x ${img.height}`;
//         selectareTotala();
//         //activare descarcare imagine
//         document.getElementById("btnLinkDownload").hidden = false;
//         //setare dimensiuni scalare
//         document.getElementById("scalareLungime").value = img.height;
//         document.getElementById("scalareLatime").value = img.width;

//         //activare setari
//         document.getElementById("histogramContainer").hidden = false;
//         document.getElementById("selectionContainer").hidden = false;
//         document.getElementById("efectContainer").hidden = false;
//         document.getElementById("textContainer").hidden = false;
//         document.getElementById("scaleContainer").hidden = false;
// });