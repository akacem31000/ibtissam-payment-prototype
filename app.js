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
let customerData = null;


// =====================================================
// Edge Functions URLs
// =====================================================

const CREATE_ORDER_FUNCTION =
    `${SUPABASE_URL}/functions/v1/paypal-create-order`;

const CAPTURE_ORDER_FUNCTION =
    `${SUPABASE_URL}/functions/v1/paypal-capture-order`;


// =====================================================
// Load courses
// =====================================================

async function loadCourses() {

    const container =
        document.getElementById("courses");

    if (!container) {

        console.error(
            "Element #courses not found."
        );

        return;
    }


    container.innerHTML =
        "<p>جاري تحميل الدورات...</p>";


    const { data, error } = await db
        .from("services")
        .select(
            "id, name, slug, type, price, currency"
        )
        .eq("type", "course")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Supabase error:",
            error
        );

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


    currentServices = data;

    container.innerHTML = "";


    // =================================================
    // Display courses
    // =================================================

    data.forEach(service => {

        const card =
            document.createElement("article");

        card.className =
            "service-card";


        card.innerHTML = `

            <h3>
                ${service.name}
            </h3>

            <p class="service-price">
                ${service.price}
                ${service.currency}
            </p>

            <button
                class="buy-button"
                data-id="${service.id}"
                type="button"
            >
                شراء الآن
            </button>

        `;


        container.appendChild(card);

    });


    // =================================================
    // Purchase buttons
    // =================================================

    document
        .querySelectorAll(".buy-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const serviceId =
                        this.getAttribute(
                            "data-id"
                        );


                    console.log(
                        "Clicked service ID:",
                        serviceId
                    );


                    startPurchase(
                        serviceId
                    );

                }
            );

        });

}


// =====================================================
// Start purchase
// =====================================================

function startPurchase(serviceId) {

    const service =
        currentServices.find(
            item =>
                String(item.id) ===
                String(serviceId)
        );


    console.log(
        "Service found:",
        service
    );


    if (!service) {

        console.error(
            "Service not found:",
            serviceId
        );

        alert(
            "لم يتم العثور على الخدمة."
        );

        return;
    }


    selectedService =
        service;


    console.log(
        "Selected service:",
        selectedService
    );


    const purchaseForm =
        document.getElementById(
            "purchase-form"
        );

    const selectedServiceBox =
        document.getElementById(
            "selected-service"
        );


    if (
        !purchaseForm ||
        !selectedServiceBox
    ) {

        console.error(
            "Purchase form elements are missing."
        );

        return;
    }


    selectedServiceBox.innerHTML = `

        <div class="service-card">

            <h3>
                ${service.name}
            </h3>

            <p class="service-price">
                ${service.price}
                ${service.currency}
            </p>

        </div>

    `;


    purchaseForm.style.display =
        "block";


    // Reset PayPal section
    hidePayPal();


    purchaseForm.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================================
// Customer form
// =====================================================

const customerForm =
    document.getElementById(
        "customer-form"
    );


if (customerForm) {

    customerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!selectedService) {

                alert(
                    "يرجى اختيار دورة أولًا."
                );

                return;
            }


            // =============================================
            // Collect customer data
            // =============================================

            customerData = {

                first_name:
                    document.getElementById(
                        "first-name"
                    ).value.trim(),

                last_name:
                    document.getElementById(
                        "last-name"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),

                country:
                    document.getElementById(
                        "country"
                    ).value.trim()

            };


            console.log(
                "Customer:",
                customerData
            );


            // =============================================
            // Validate customer data
            // =============================================

            if (
                !customerData.first_name ||
                !customerData.last_name ||
                !customerData.email
            ) {

                alert(
                    "يرجى ملء الاسم واللقب والبريد الإلكتروني."
                );

                return;
            }


            // =============================================
            // Show PayPal
            // =============================================

            showPayPal();


            // Render PayPal buttons
            renderPayPalButtons();

        }
    );

}


// =====================================================
// Show PayPal section
// =====================================================

function showPayPal() {

    const section =
        document.getElementById(
            "paypal-section"
        );


    if (section) {

        section.style.display =
            "block";

    }

}


// =====================================================
// Hide PayPal section
// =====================================================

function hidePayPal() {

    const section =
        document.getElementById(
            "paypal-section"
        );

    const container =
        document.getElementById(
            "paypal-button-container"
        );

    const message =
        document.getElementById(
            "paypal-message"
        );


    if (section) {

        section.style.display =
            "none";

    }


    if (container) {

        container.innerHTML =
            "";

    }


    if (message) {

        message.innerHTML =
            "";

    }

}


// =====================================================
// Render PayPal Buttons
// =====================================================

function renderPayPalButtons() {

    const container =
        document.getElementById(
            "paypal-button-container"
        );


    if (!container) {

        console.error(
            "PayPal button container not found."
        );

        return;
    }


    if (
        typeof paypal ===
        "undefined"
    ) {

        console.error(
            "PayPal SDK is not loaded."
        );

        showPayPalMessage(
            "تعذر تحميل PayPal. يرجى إعادة تحميل الصفحة."
        );

        return;
    }


    // Prevent duplicate buttons

    container.innerHTML =
        "";


    paypal.Buttons({

        // =============================================
        // Create PayPal Order
        // =============================================

        createOrder: async function () {

            try {

                showPayPalMessage(
                    "جاري إنشاء طلب الدفع..."
                );


const response =
    await fetch(
        CREATE_ORDER_FUNCTION,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                "apikey":
                    SUPABASE_PUBLISHABLE_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
            },

            body: JSON.stringify({
                service_id:
                    selectedService.id
            })
        }
    );

                const result =
                    await response.json();


                console.log(
                    "Create order response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.error ||
                        "فشل إنشاء طلب PayPal."
                    );

                }


                showPayPalMessage(
                    ""
                );


                return result.order_id;


            } catch (error) {

                console.error(
                    "Create PayPal order error:",
                    error
                );


                showPayPalMessage(
                    "حدث خطأ أثناء إنشاء طلب الدفع."
                );


                throw error;

            }

        },


        // =============================================
        // Approve + Capture
        // =============================================

        onApprove: async function (
            data
        ) {

            try {

                showPayPalMessage(
                    "جاري تأكيد عملية الدفع..."
                );


                console.log(
                    "PayPal approved order:",
                    data.orderID
                );


                const response =
                    await fetch(
                        CAPTURE_ORDER_FUNCTION,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    order_id:
                                        data.orderID
                                })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Capture response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success ||
                    result.payment_status !==
                        "COMPLETED"
                ) {

                    throw new Error(
                        result.error ||
                        "لم تكتمل عملية الدفع."
                    );

                }


                // =====================================
                // Payment successful
                // =====================================

                showPayPalMessage(
                    `
                    <div class="payment-success">
                        <h3>تم الدفع بنجاح ✓</h3>

                        <p>
                            شكرًا لك.
                            تم تأكيد عملية الدفع.
                        </p>

                        <p>
                            رقم الطلب:
                            ${result.order_id}
                        </p>
                    </div>
                    `
                );


                console.log(
                    "PAYMENT COMPLETED:",
                    result
                );


                // =====================================
                // IMPORTANT
                // Customer/order database will be
                // connected in the next step.
                // =====================================


            } catch (error) {

                console.error(
                    "Capture error:",
                    error
                );


                showPayPalMessage(
                    "لم تكتمل عملية الدفع. يرجى المحاولة مرة أخرى."
                );

            }

        },


        // =============================================
        // Cancel
        // =============================================

        onCancel: function (
            data
        ) {

            console.log(
                "PayPal payment cancelled:",
                data
            );


            showPayPalMessage(
                "تم إلغاء عملية الدفع."
            );

        },


        // =============================================
        // Error
        // =============================================

        onError: function (
            error
        ) {

            console.error(
                "PayPal error:",
                error
            );


            showPayPalMessage(
                "حدث خطأ أثناء الاتصال بـ PayPal."
            );

        }

    }).render(
        "#paypal-button-container"
    );

}


// =====================================================
// PayPal message
// =====================================================

function showPayPalMessage(
    message
) {

    const element =
        document.getElementById(
            "paypal-message"
        );


    if (element) {

        element.innerHTML =
            message;

    }

}


// =====================================================
// Start application
// =====================================================

loadCourses();
