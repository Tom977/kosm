document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Firebase inicjalizowany...");

    if (!firebase.apps.length) {
        console.error("❌ Firebase NIE został poprawnie zainicjalizowany!");
        return;
    }

    emailjs.init("X7tzFIWIECz5lsO2Z"); // Zmień na swój Public Key z EmailJS

    const container = document.getElementById("product-list");

    function loadProducts() {
        db.ref("/7/products").once("value")
            .then(snapshot => {
                console.log("📦 Pobieranie produktów...");
                const products = snapshot.val();
                console.log("📦 Produkty z Firebase:", products);
    
                const container = document.getElementById("product-list");
                container.innerHTML = ""; // Czyszczenie kontenera przed dodaniem produktów
    
                if (!products || Object.keys(products).length === 0) {
                    console.warn("❌ Brak produktów do wyświetlenia!");
                    container.innerHTML = "<p>Brak produktów do wyświetlenia.</p>";
                    return;
                }
    
                Object.keys(products).forEach(productId => {
                    const product = products[productId];
    
                    if (product.quantity === 0) return; // Ukrywamy produkty z zerową ilością
    
                    const card = document.createElement("div");
                    card.classList.add("product-card");
                    card.setAttribute("id", `product-${productId}`);
                    
                    // Upewniamy się, że `product.quantity` jest poprawnie umieszczony wewnątrz karty
                    card.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p>${product.description}</p>
                        <p class="price"><strong>Cena:</strong> ${product.price} PLN</p>
                        <p class="quantity"><strong>Dostępność:</strong> <span id="quantity-${productId}">${product.quantity}</span> szt.</p>
                        <button class="reserve-btn" data-id="${productId}">Rezerwuj</button>
                        <div class="reservation-form" id="reservation-form-${productId}" style="display: none;">
                            <input type="text" id="user-name-${productId}" placeholder="Twoje imię" required>
                            <button class="send-reservation" data-id="${productId}">Wyślij rezerwację</button>
                        </div>
                    `;
    
                    container.appendChild(card);
                });
    
                addEventListeners();
            })
            .catch(error => {
                console.error("❌ Błąd wczytywania produktów:", error);
                document.getElementById("product-list").innerHTML = "<p>Błąd ładowania danych. Sprawdź konsolę.</p>";
            });
    }
    
    
    function addEventListeners() {
    document.querySelectorAll(".reserve-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            document.getElementById(`reservation-form-${productId}`).style.display = "block";
            event.target.style.display = "none"; // Ukrywamy przycisk "Rezerwuj"
        });
    });

    document.querySelectorAll(".send-reservation").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            const userName = document.getElementById(`user-name-${productId}`).value.trim();
            const quantityElement = document.getElementById(`quantity-${productId}`);

            if (!userName) {
                alert("Podaj swoje imię przed wysłaniem rezerwacji!");
                return;
            }

            const productRef = db.ref(`/7/products/${productId}`);

            productRef.once("value").then(snapshot => {
                let currentQuantity = snapshot.val()?.quantity;

                if (!currentQuantity || currentQuantity <= 0) {
                    alert("❌ Produkt został już wyprzedany!");
                    document.getElementById(`product-${productId}`).remove(); // Usuwamy produkt z listy
                    return;
                }

                // Zmniejszamy ilość o 1
                currentQuantity--;

                productRef.update({ quantity: currentQuantity })
                    .then(() => {
                        console.log(`✅ Produkt ${productId} zaktualizowany w Firebase`);
                        quantityElement.textContent = currentQuantity;

                        // Jeśli produkt nadal jest dostępny, przywracamy przycisk "Rezerwuj"
                        if (currentQuantity > 0) {
                            document.getElementById(`reservation-form-${productId}`).style.display = "none"; // Ukrywamy formularz
                            const reserveButton = document.querySelector(`.reserve-btn[data-id="${productId}"]`);
                            reserveButton.style.display = "inline-block"; // Przywracamy przycisk "Rezerwuj"
                        } else {
                            document.getElementById(`product-${productId}`).remove(); // Ukrywamy produkt, jeśli ilość = 0
                        }
                    })
                    .catch(error => console.error("❌ Błąd aktualizacji Firebase:", error));

                sendEmailNotification(userName, productId);
            });
        });
    });
}

    
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
    
    window.addEventListener("beforeunload", () => {
    console.log("🚪 Użytkownik opuszcza stronę, zamykamy połączenie Firebase.");
    db.goOffline(); // Zamykamy połączenie, aby zwolnić limit Firebase
});

});
