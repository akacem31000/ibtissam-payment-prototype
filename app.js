// =====================================================
// TEST - التأكد أن GitHub Pages يحمل النسخة الجديدة
// =====================================================

alert("هذه هي النسخة الجديدة من app.js");


// =====================================================
// Supabase configuration
// =====================================================

console.log("APP.JS IS WORKING");

const SUPABASE_URL = "https://tmhokjnhtmptksyjaghx.supabase.co";
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
// Global variables
// =====================================================

let currentServices = [];
let selectedService = null;


// =====================================================
// Load courses
// =====================================================

async function loadCourses() {

    const container = document.getElementById("courses");

    if (!container) {
        console.error("Element #courses not found.");
        return;
    }

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


    // Save services
    currentServices = data;


    // Clear loading
    container.innerHTML = "";


    // Display courses
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
                data-id="${service.id}"
            >
                شراء الآن
            </button>
        `;


        container.appendChild(card);

    });


    // =================================================
    // Purchase buttons
    // =================================================

    document.querySelectorAll(".buy-button").forEach(button => {

        button.addEventListener("click", function () {

            const serviceId = this.getAttribute("data-id");

            console.log(
                "Clicked service ID:",
                serviceId
            );

            startPurchase(serviceId);

        });

    });

}


// =====================================================
// Start purchase
// =====================================================

function startPurchase(serviceId) {

    console.log(
        "startPurchase received ID:",
        serviceId
    );


    const service = currentServices.find(
        item => String(item.id) === String(serviceId)
    );


    console.log(
        "Service found:",
        service
    );


    if (!service) {

        console.error(
            "Service not found for ID:",
            serviceId
        );

        alert("لم يتم العثور على الخدمة.");

        return;
    }


    // Save selected service
    selectedService = service;


    console.log(
        "Selected service:",
        selectedService
    );


    const purchaseForm =
        document.getElementById("purchase-form");

    const selectedServiceBox =
        document.getElementById("selected-service");


    if (!purchaseForm || !selectedServiceBox) {

        console.error(
            "Purchase form elements are missing."
        );

        alert(
            "نموذج الشراء غير موجود في الصفحة."
        );

        return;
    }


    // Display selected service

    selectedServiceBox.innerHTML = `

        <div class="service-card">

            <h3>${service.name}</h3>

            <p class="service-price">
                ${service.price} ${service.currency}
            </p>

        </div>

    `;


    // Show form

    purchaseForm.style.display = "block";


    // Scroll

    purchaseForm.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================================
// Customer form
// =====================================================

const customerForm =
    document.getElementById("customer-form");


if (customerForm) {

    customerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (!selectedService) {

                alert(
                    "يرجى اختيار دورة أولًا."
                );

                return;
            }


            const customer = {

                first_name:
                    document.getElementById(
                        "first-name"
                    ).value,

                last_name:
                    document.getElementById(
                        "last-name"
                    ).value,

                email:
                    document.getElementById(
                        "email"
                    ).value,

                phone:
                    document.getElementById(
                        "phone"
                    ).value,

                country:
                    document.getElementById(
                        "country"
                    ).value

            };


            console.log(
                "Selected service:",
                selectedService
            );


            console.log(
                "Customer:",
                customer
            );


            alert(

                "تم تسجيل بيانات الطلب التجريبية.\n\n" +

                "الخدمة: " +
                selectedService.name +

                "\nالسعر: " +
                selectedService.price +
                " " +
                selectedService.currency +

                "\n\nالخطوة التالية ستكون PayPal Sandbox."

            );

        }
    );

} else {

    console.warn(
        "Customer form not found."
    );

}


// =====================================================
// Start application
// =====================================================

loadCourses();
