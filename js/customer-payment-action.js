(function () {

  "use strict";

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      const db =
        window.memoraSupabase;

      if (!db) {
        return;
      }

      const params =
        new URLSearchParams(
          window.location.search
        );

      const orderId =
        params.get("id") ||
        params.get("order");

      if (!orderId) {
        return;
      }


      try {

        const {
          data: sessionData
        } =
          await db.auth.getSession();


        const user =
          sessionData?.session?.user;

        if (!user) {
          return;
        }


        const customerResult =
          await db
            .from("customers")
            .select("id")
            .eq(
              "auth_user_id",
              user.id
            )
            .maybeSingle();


        if (
          customerResult.error ||
          !customerResult.data
        ) {
          return;
        }


        const orderResult =
          await db
            .from("orders")
            .select(`
              id,
              order_number,
              customer_id,
              payment_status,
              grand_total,
              total_paid,
              remaining_amount
            `)
            .eq(
              "id",
              orderId
            )
            .eq(
              "customer_id",
              customerResult.data.id
            )
            .maybeSingle();


        if (
          orderResult.error ||
          !orderResult.data
        ) {
          return;
        }


        const order =
          orderResult.data;


        const existing =
          document.getElementById(
            "memoraPaymentAction"
          );

        if (existing) {
          existing.remove();
        }


        const wrapper =
          document.createElement(
            "section"
          );


        wrapper.id =
          "memoraPaymentAction";


        wrapper.innerHTML = `
          <div class="memora-payment-card">

            <div class="memora-payment-copy">

              <span class="memora-payment-eyebrow">
                PAYMENT
              </span>

              <h2>
                Pembayaran
              </h2>

              <p>
                ${
                  order.payment_status === "lunas"
                    ? "Pembayaran untuk pesanan ini sudah lunas."
                    : "Kirim konfirmasi pembayaran dan bukti transfer untuk pesanan ini."
                }
              </p>

            </div>

            <div class="memora-payment-action">

              ${
                order.payment_status === "lunas"

                  ? `
                      <button
                        type="button"
                        class="memora-payment-button completed"
                        disabled
                      >
                        Pembayaran Lunas
                      </button>
                    `

                  : `
                      <a
                        href="/payment/?order=${encodeURIComponent(order.id)}"
                        class="memora-payment-button"
                      >
                        Konfirmasi Pembayaran
                      </a>
                    `
              }

            </div>

          </div>
        `;


        const target =
          document.querySelector(
            ".order-detail-shell"
          ) ||
          document.querySelector(
            ".account-content"
          ) ||
          document.querySelector(
            "main"
          );


        if (target) {

          target.appendChild(
            wrapper
          );

        }


        if (
          !document.getElementById(
            "memoraPaymentActionStyle"
          )
        ) {

          const style =
            document.createElement(
              "style"
            );


          style.id =
            "memoraPaymentActionStyle";


          style.textContent = `

            #memoraPaymentAction {
              width:100%;
              margin-top:20px;
            }

            .memora-payment-card {
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:24px;

              padding:22px;

              background:#ffffff;

              border:1px solid #dedfda;
              border-radius:14px;
            }

            .memora-payment-copy {
              min-width:0;
            }

            .memora-payment-eyebrow {
              display:block;

              margin-bottom:6px;

              color:#405247;

              font-family:
                "Inter",
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Text",
                Arial,
                sans-serif;

              font-size:11px;
              font-weight:700;
              letter-spacing:.12em;
            }

            .memora-payment-card h2 {
              margin:0;

              color:#25211f;

              font-family:
                "Inter",
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Text",
                Arial,
                sans-serif;

              font-size:18px;
              font-weight:700;
            }

            .memora-payment-card p {
              max-width:580px;

              margin:6px 0 0;

              color:#7b736d;

              font-family:
                "Inter",
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Text",
                Arial,
                sans-serif;

              font-size:13px;
              line-height:1.55;
            }

            .memora-payment-button {
              min-height:44px;

              display:inline-flex;
              align-items:center;
              justify-content:center;

              padding:10px 17px;

              border:1px solid #405247;
              border-radius:9px;

              background:#405247;
              color:#ffffff;

              font-family:
                "Inter",
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Text",
                Arial,
                sans-serif;

              font-size:13px;
              font-weight:600;

              text-decoration:none;

              white-space:nowrap;
            }

            .memora-payment-button:hover {
              opacity:.92;
            }

            .memora-payment-button.completed {
              background:#edf2ee;
              border-color:#d8e1da;
              color:#405247;
              cursor:default;
            }

            @media (max-width:700px) {

              .memora-payment-card {
                display:block;
              }

              .memora-payment-action {
                margin-top:16px;
              }

              .memora-payment-button {
                width:100%;
              }

            }

          `;


          document.head.appendChild(
            style
          );

        }

      }
      catch (error) {

        console.error(
          "Payment action:",
          error
        );

      }

    }
  );

})();