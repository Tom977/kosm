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
    
    dbRef.on("value", snapshot => {  // 🔄 Nasłuchujemy zmian w Firebase w czasie rzeczywistym
        const products = snapshot.val();
        container.innerHTML = ""; // Czyścimy i odświeżamy produkty

        if (!products) {
            container.innerHTML = "<p>Brak produktów do wyświetlenia.</p>";
            return;
        }

        Object.keys(products).forEach(productId => {
            const product = products[productId];

            if (product.quantity === 0) return; // Ukrywamy produkty z zerową ilością

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

        addEventListeners();
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

        const productRef = db.ref(`/products/${productId}`);

        productRef.once("value").then(snapshot => {
            let currentQuantity = snapshot.val().quantity;

            if (currentQuantity > 0) {
                currentQuantity--;

                productRef.update({ quantity: currentQuantity })
                    .then(() => {
                        console.log(`✅ Produkt ${productId} zaktualizowany w Firebase`);
                        document.getElementById(`quantity-${productId}`).textContent = currentQuantity;

                        // Ukrywamy formularz i pokazujemy przycisk "Rezerwuj" jeśli produkt nadal dostępny
                        if (currentQuantity > 0) {
                            document.getElementById(`reservation-form-${productId}`).style.display = "none";
                            document.querySelector(`.reserve-btn[data-id="${productId}"]`).style.display = "inline-block";
                        } else {
                            document.getElementById(`product-${productId}`).remove();
                        }
                    })
                    .catch(error => console.error("❌ Błąd aktualizacji Firebase:", error));
            } else {
                alert("❌ Produkt został już wyprzedany!");
                document.getElementById(`product-${productId}`).remove(); // Ukrywamy produkt, jeśli już się wyprzedał
            }
        });
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
