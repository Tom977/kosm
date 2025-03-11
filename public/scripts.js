document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Firebase inicjalizowany...");

    if (!firebase.apps.length) {
        console.error("❌ Firebase NIE został poprawnie zainicjalizowany!");
        return;
    }

    emailjs.init("X7tzFIWIECz5lsO2Z"); // Zmień na swój Public Key z EmailJS

    const container = document.getElementById("product-list");

    function loadProducts() {
    const container = document.getElementById("product-list");
    container.innerHTML = ""; // Czyścimy listę produktów

    const dbRef = db.ref("/7/products");

    dbRef.on("value", snapshot => { // 🔄 Automatyczna aktualizacja
        const products = snapshot.val();
        container.innerHTML = ""; // Odświeżamy produkty

        if (!products) {
            container.innerHTML = "<p>Brak produktów do wyświetlenia.</p>";
            return;
        }

        Object.keys(products).forEach(productId => {
            const product = products[productId];

            // Jeśli produkt się wyprzedał, usuwamy go z listy
            if (product.quantity === 0) {
                const existingCard = document.getElementById(`product-${productId}`);
                if (existingCard) {
                    existingCard.remove();
                }
                return;
            }

            let existingCard = document.getElementById(`product-${productId}`);
            if (existingCard) {
                // Jeśli produkt już istnieje, aktualizujemy tylko jego ilość
                document.getElementById(`quantity-${productId}`).textContent = product.quantity;
                return;
            }

            // Tworzymy nową kartę produktu
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.setAttribute("id", `product-${productId}`);
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p class="price"><strong>Cena:</strong> ${product.price} PLN</p>
                <p class="quantity"><strong>Dostępność:</strong> <span id="quantity-${productId}">${product.quantity}</span> szt.</p>
                <button class="reserve-btn" data-id="${productId}" ${product.quantity === 0 ? "disabled" : ""}>Rezerwuj</button>
                <div class="reservation-form" id="reservation-form-${productId}" style="display: none;">
                    <input type="text" id="user-name-${productId}" placeholder="Twoje imię" required>
                    <button class="send-reservation" data-id="${productId}">Wyślij rezerwację</button>
                </div>
            `;
            container.appendChild(card);
        });

        addEventListeners(); // Ponownie dodajemy event listenery
    });
}


    
    
    document.addEventListener("click", (event) => {
    if (event.target.classList.contains("send-reservation")) {
        const productId = event.target.getAttribute("data-id");
        const userName = document.getElementById(`user-name-${productId}`).value.trim();

        if (!userName) {
            alert("Podaj swoje imię przed wysłaniem rezerwacji!");
            return;
        }

        const productRef = db.ref(`/7/products/${productId}`);

        productRef.transaction(product => {
            if (product && product.quantity > 0) {
                product.quantity -= 1; // Odejmujemy ilość produktu
                return product; // Aktualizujemy Firebase
            } else {
                alert("❌ Produkt został już wyprzedany!");
                return; // Nie zmieniamy Firebase
            }
        }).then(result => {
            if (!result.committed) return; // Jeśli transakcja nie przeszła, kończymy funkcję

            const newQuantity = result.snapshot.val().quantity; // Pobieramy nową ilość

            if (newQuantity === 0) {
                document.getElementById(`product-${productId}`).remove(); // Usuwamy produkt, jeśli wyprzedany
            } else {
                document.getElementById(`quantity-${productId}`).textContent = newQuantity; // Aktualizujemy ilość w UI
                document.getElementById(`reservation-form-${productId}`).style.display = "none"; // Ukrywamy formularz
                document.querySelector(`.reserve-btn[data-id="${productId}"]`).style.display = "inline-block"; // Pokazujemy "Rezerwuj"
            }

            console.log(`✅ Rezerwacja potwierdzona! Pozostało: ${newQuantity} szt.`);
        }).catch(error => console.error("❌ Błąd Firebase:", error));
    }
});



    
    function sendEmailNotification(userName, productId) {
        const productRef = db.ref(`/7/products/${productId}`);
        productRef.once("value").then(snapshot => {
            const product = snapshot.val();

            emailjs.send("service_tks58ds", "template_0o7qlxq", {
                to_email: "xthomsonx3@gmail.com",  
                user_name: userName,
                product_name: product.name
            }).then(response => {
                console.log("📧 Email wysłany!", response);
                alert(`✅ Rezerwacja produktu "${product.name}" została wysłana!`);
            }).catch(error => {
                console.error("❌ Błąd wysyłania e-maila:", error);
                alert("Błąd wysyłania e-maila! Sprawdź konsolę.");
            });
        });
    }

    loadProducts();
});
