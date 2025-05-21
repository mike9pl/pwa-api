document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('RefreshData');
    const dataContainer = document.getElementById('DataContainer');

    if (refreshButton) {
        refreshButton.addEventListener('click', FetchGoldData);
    }
        const lastValue = 14
        const apiUrl = `https://api.nbp.pl/api/cenyzlota/last/${lastValue}/?format=json`;
        
        async function FetchGoldData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            DisplayGoldData(data);
        } catch (error) {
            console.error('Error while downloading data from API:', error);
            dataContainer.innerHTML = `<p>Nie udalo sie pobrac danych: ${error.message}.</p>`;
        }
    }

    function DisplayGoldData(data) {
        if (!data) {
            dataContainer.innerHTML = '<p>Brak danych.</p>';
            return;
        }
        dataContainer.innerHTML = "";

        for (let i = 0; i < data.length; i++) {
            const date = data[i].data;
            const price = data[i].cena;
            dataContainer.innerHTML += `
            <p>
                <strong>Data:</strong> ${date}
                <strong>Cena:</strong> ${price}PLN
            </p>
            `;
        }
    }
});