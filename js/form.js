document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'UserDB';
    const storeName = 'UserData';
    let db;

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);

            request.onerror = event => {
                console.error('IndexedDB error:', event.target.errorCode);
                reject('IndexedDB error');
            };

            request.onsuccess = event => {
                db = event.target.result;
                console.log('IndexedDB open successfully');
                resolve(db);
            };

            request.onupgradeneeded = event => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('email', 'email', { unique: true });
                    console.log('Object store created');
                }
            };
        });
    }

    function addData(data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.add(data);

            request.onsuccess = () => {
                console.log('Data add successfully');
                resolve();
            };

            request.onerror = event => {
                console.error('Error adding data:', event.target.errorCode);
                reject('Error adding data');
            };
        });
    }

    function getAllData() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                console.error('Error getting all data:', event.target.errorCode);
                reject('Error getting all data');
            };
        });
    }

    function displayData() {
        const dataList = document.getElementById('dataList');
        if (!dataList) return;

        getAllData().then(data => {
            dataList.innerHTML = '';
            if (data.length === 0) {
                dataList.innerHTML = '<li>Brak zapisanych danych.</li>';
                return;
            }
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `Imię: ${item.name}, Email: ${item.email}`;
                dataList.appendChild(li);
            });
        }).catch(error => {
            console.error('Failed to display data:', error);
        });
    }

    // Form handling
    const dataForm = document.getElementById('dataForm');
    if (dataForm) {
        dataForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            try {
                await addData({ name, email });
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                displayData();
            } catch (error) {
                alert('Wystąpił błąd podczas zapisu danych. Sprawdź konsolę.');
            }
        });
    }

    // Initializing DB and loading data
    openDatabase().then(() => {
        if (document.getElementById('dataList')) {
            displayData();//Only on the formView
        }
    }).catch(error => {
        console.error('Failed to initialize IndexedDB:', error);
    });
});