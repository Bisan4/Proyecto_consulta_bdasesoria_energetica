// Funciones para validar el formato del CIF, nombre, comercializadora y estado
function validateCIF(cif) {
    const cifRegex = /^[A-Za-z0-9]{8,10}$/; // CIF debe tener entre 8 y 10 caracteres
    return cifRegex.test(cif);
}

function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/; // Nombre debe contener solo letras y espacios
    return nameRegex.test(name);
}

function validateCommercializer(commercializer) {
    const commercializerRegex = /^[a-zA-Z\s]+$/; // Comercializadora debe contener solo letras y espacios
    return commercializerRegex.test(commercializer);
}

function validateState(state) {
    const stateRegex = /^[a-zA-Z\s]+$/; // Estado debe contener solo letras y espacios
    return stateRegex.test(state);
}

async function searchContracts() {
    // Obtener los valores de los campos de entrada y limpiar los espacios en blanco alrededor
    const cifInput = document.getElementById('cifInput').value.trim();
    const nameInput = document.getElementById('nameInput').value.trim();
    const commercializerInput = document.getElementById('commercializerInput').value.trim();
    const stateInput = document.getElementById('stateInput').value.trim();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Validar al menos un campo
    if (!(cifInput || nameInput || commercializerInput || stateInput)) {
        alert('Debe ingresar al menos un campo para realizar la búsqueda.');
        return;
    }

    // Validar campos individuales si se ingresaron
    if (cifInput && !validateCIF(cifInput)) {
        alert('Por favor ingrese un CIF válido.');
        return;
    }
    if (nameInput && !validateName(nameInput)) {
        alert('Por favor ingrese un nombre válido.');
        return;
    }
    if (commercializerInput && !validateCommercializer(commercializerInput)) {
        alert('Por favor ingrese un nombre de comercializadora válido.');
        return;
    }
    if (stateInput && !validateState(stateInput)) {
        alert('Por favor ingrese un estado válido.');
        return;
    }

    // URL de la API de consulta
    const url = `http://192.168.101.4:3000/asesoria_energetica`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        // Filtrar los datos según los criterios de búsqueda
        const filteredData = data.filter(item => {
            return (!cifInput || item.CIF === cifInput) &&
                   (!nameInput || item.NOMBRE.toLowerCase().includes(nameInput.toLowerCase())) &&
                   (!commercializerInput || item.COMERCIALIZADORA.toLowerCase().includes(commercializerInput.toLowerCase())) &&
                   (!stateInput || item.ESTADO.toLowerCase().includes(stateInput.toLowerCase()));
        });

        if (filteredData.length > 0) {
            displayResults(filteredData);
        } else {
            resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al realizar la búsqueda. Por favor, verifica que la API esté funcionando correctamente y que la URL sea correcta.');
    }
}

// Función para mostrar los resultados de la búsqueda en tarjetas
function displayResults(data) {
    const resultsDiv = document.getElementById('results');

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card animate__animated animate__fadeInUp';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.textContent = item.CIF;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardText = `
            <p><strong>Nombre:</strong> ${item.NOMBRE}</p>
            <p><strong>CUPS:</strong> ${item.CUPS}</p>
            <p><strong>Tarifa:</strong> ${item.TARIFA}</p>
            <p><strong>Comercializadora:</strong> ${item.COMERCIALIZADORA}</p>
            <p><strong>Comercial:</strong> ${item.COMERCIAL}</p>
            <p><strong>Estado:</strong> ${item.ESTADO}</p>
            <p><strong>Acciones:</strong> ${item.ACCIONES}</p>
            <p><strong>Fecha:</strong> ${item.FECHA}</p>
            <p><strong>Pagado:</strong> ${item.PAGADO || 'N/A'}</p>
            <p><strong>O 50%:</strong> ${item['O 50%'] || 'N/A'}</p>
            <p><strong>Documentos Adjuntos:</strong> ${item['DOCUMENTOS ADJUNTOS'] || 'N/A'}</p>
            <p><strong>Fecha de Acabar Contrato:</strong> ${item['FECHA DE ACABAR CONTRATO'] || 'N/A'}</p>
        `;

        cardBody.innerHTML = cardText;
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        resultsDiv.appendChild(card);
    });
}

// Función para obtener los datos de la API
async function fetchContractData() {
    const url = 'http://192.168.101.4:3000/asesoria_energetica';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos:', error);
        return [];
    }
}

// Función para generar y mostrar las nuevas gráficas
async function generateCharts() {
    const data = await fetchContractData();

    const estados = {};
    const pagados = { 'Pagados': 0, 'No Pagados': 0 };
    const comercializadoras = {};

    data.forEach(item => {
        // Conteo de contratos por estado
        if (item.ESTADO) {
            if (item.ESTADO in estados) {
                estados[item.ESTADO]++;
            } else {
                estados[item.ESTADO] = 1;
            }
        }

        // Conteo de contratos pagados
        if (item.PAGADO) {
            pagados['Pagados'] += item.PAGADO;
        } else {
            pagados['No Pagados']++;
        }

        // Conteo de contratos por comercializadora
        if (item.COMERCIALIZADORA) {
            if (item.COMERCIALIZADORA in comercializadoras) {
                comercializadoras[item.COMERCIALIZADORA]++;
            } else {
                comercializadoras[item.COMERCIALIZADORA] = 1;
            }
        }
    });

    // Preparar datos para las nuevas gráficas
    const estadosLabels = Object.keys(estados);
    const estadosData = Object.values(estados);

    const pagadosLabels = Object.keys(pagados);
    const pagadosData = Object.values(pagados);

    const comercializadorasLabels = Object.keys(comercializadoras).filter(label => !!label);
    const comercializadorasData = Object.values(comercializadoras).filter(value => !!value);

    // Generar y mostrar las nuevas gráficas
    generatePieChart('chartEstados', 'Distribución por Estado', estadosLabels, estadosData);
    generatePieChart('chartPagados', 'Distribución de Pagos', pagadosLabels, pagadosData);
    generateBarChart('chartComercializadoras', 'Distribución por Comercializadora', comercializadorasLabels, comercializadorasData);
}

// Función para generar gráfica de pastel
function generatePieChart(canvasId, title, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: getRandomColors(data.length),
            }]
        },
        options: {
            responsive: false,
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: title
            }
        }
    });
}

// Función para generar gráfica de barras
function generateBarChart(canvasId, title, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: getRandomColors(data.length),
                borderColor: getRandomColors(data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Función para generar colores aleatorios
function getRandomColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`);
    }
    return colors;
}

// Llamada a la función para generar las gráficas al cargar la página
generateCharts();

