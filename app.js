// =====================================================
// Supabase configuration
// =====================================================
console.log("APP.JS IS WORKING");
const SUPABASE_URL = "https://tmhokjnhtmptksyjaghx.supabase.co/rest/v1/";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eg7ZGgdEJ7TPg4QM-uEekA_eRFDUhGy";


// =====================================================
// Initialize Supabase
// =====================================================

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// Load courses
// =====================================================

async function loadCourses() {

    const container = document.getElementById("courses");

    container.innerHTML = "<p>جاري تحميل الدورات...</p>";

    const { data, error } = await db
        .from("services")
        .select("id, name, slug, type, price, currency")
        .eq("type", "course")
        .order("id", { ascending: true });


    if (error) {

        console.error("Supabase error:", error);

        container.innerHTML = `
            <div class="error">
                حدث خطأ أثناء تحميل الدورات.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="error">
                لا توجد دورات متاحة حاليًا.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    data.forEach(service => {

        const card = document.createElement("article");

        card.className = "service-card";


        card.innerHTML = `
            <h3>${service.name}</h3>

            <p class="service-price">
                ${service.price} ${service.currency}
            </p>

            <button
                class="buy-button"
                data-service-id="${service.id}"
                data-service-slug="${service.slug}"
            >
                شراء الآن
            </button>
        `;


        container.appendChild(card);

    });


    // Add click events to buttons

    document.querySelectorAll(".buy-button").forEach(button => {

        button.addEventListener("click", () => {

            const serviceId = button.dataset.serviceId;
            const serviceSlug = button.dataset.serviceSlug;

            startPurchase(serviceId, serviceSlug);

        });

    });

}


// =====================================================
// Purchase - prototype only
// =====================================================

function startPurchase(serviceId, serviceSlug) {

    alert(
        "تم اختيار الخدمة رقم: " +
        serviceId +
        "\n\nSlug: " +
        serviceSlug +
        "\n\nسنربط هذه الخطوة لاحقًا مع PayPal."
    );

}


// =====================================================
// Start application
// =====================================================

loadCourses();
